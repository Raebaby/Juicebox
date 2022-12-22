const { Client } = require('pg') // imports the pg module

const client = new Client('postgres://localhost:5432/juicebox-dev');

/**
 * USER Methods
 */

async function createUser({ 
  username, 
  password,
  name,
  location
}) {
  try {
    const { rows: [ user ] } = await client.query(`
      INSERT INTO users(username, password, name, location) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `, [username, password, name, location]);

    return user;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [ user ] } = await client.query(`
      UPDATE users
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `, Object.values(fields));

    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  try {
    const { rows } = await client.query(`
      SELECT id, username, name, location, active 
      FROM users;
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}


async function getUserById(userId) {
  try {
    const { rows: [ user ] } = await client.query(`
      SELECT id, username, name, location, active
      FROM users
      WHERE id=${ userId }
    `);

    if (!user) {
      return null
    }

    user.posts = await getPostsByUser(userId);

    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * POST Methods
 */

async function createPost({
  authorId,
  title,
  content,
  tags = [] // this is new
}) {
  try {
    const { rows: [ post ] } = await client.query(`
      INSERT INTO posts("authorId", title, content) 
      VALUES($1, $2, $3)
      RETURNING *;
    `, [authorId, title, content]);

    const tagList = await createTags(tags);

    return await addTagsToPost(post.id, tagList);
    console.log("rows: [post] from create post", post);
  } catch (error) {
    console.log("There was an error creating the post")
    throw error;
  }
}

const updatePost = async (postId, fields = {}) => {
  const {tags} = fields //Grab the tags from the fields you want to upset 
  delete fields.tags; //Delete them from the field for whatever reason
  let setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  
  try {
    if (setString ) {
      await client.query(
        `
      UPDATE posts
      SET ${setString}
      WHERE id=${ postId }
      RETURNING * ;
      `,
        Object.values(fields));
        
    }
   
      if ( tags === undefined ) {
        return  await getPostById(postId)
      }
      const tagList = await createTags(tags)
      const tagListIdString = tagList.map(tag => `${tag.id}`).join(', ')

      await client.query(`
      DELETE FROM post_tags
      WHERE "tagId"
      NOT IN (${ tagListIdString  })
      AND "postId"=$1
      `, [postId])
      await addTagsToPost(postId, tagList);

      const newPost = await getPostById(postId)
      return newPost
    
  } catch (error) {
    console.log("There was an error updating users posts!");
    throw error;
  }
};


const getAllPosts = async () => {
  
  try {
    const { rows: postIds } = await client.query(`
    SELECT id
    FROM posts;
    `);
    const posts = await Promise.all(
      postIds.map((post) =>  getPostById(post.id))
    );
    console.log('All the posts here yo', posts)
    return posts;
  } catch (error) {
    console.log("There was an error getting all the posts");
    throw error;
  }
};

const getPostsByUser = async (userId) => {
  try {
    const { rows: postIds } = await client.query(`
    SELECT id
    FROM posts
    WHERE "authorId"=${userId}
    `);
    
    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );

    return posts;
  } catch (error) {
    console.log("There was an error fetchings posts by user");
  }
};


/*Tags*/

async function createTags(tagList) {
  if (tagList.length === 0) { 
    return; 
  } 
  
  const insertValues = tagList.map(
    (_, index) => `$${index + 1}`).join('), (');

  const selectValues = tagList.map(
    (_, index) => `$${index + 1}`).join(', ');

  try {
    await client.query(`
      INSERT INTO tags(name)
      VALUES (${insertValues})
      ON CONFLICT (name) DO NOTHING;
    `, tagList);

    const {rows} = await client.query(`
      SELECT * FROM tags
      WHERE name
      IN (${selectValues});
    `, tagList);

    return rows;
  } catch (error) {
    console.log("Error creating tags!");
    throw error;
  }
}

async function createPostTag(postId, tagId) {
  try {
    await client.query(`
      INSERT INTO post_tags("postId", "tagId")
      VALUES ($1, $2)
      ON CONFLICT ("postId", "tagId") DO NOTHING;
    `, [postId, tagId]);
  } catch (error) {
    console.log("Error creating post tags!");
    throw error;
  }
}

const getPostsByTagName = async (tagName) => {
  try {
    const { rows: postIds } = await client.query(`
      SELECT posts.id
      FROM posts
      JOIN post_tags ON posts.id=post_tags."postId"
      JOIN tags ON tags.id=post_tags."tagId"
      WHERE tags.name=$1;
    `, [tagName]);

    return await Promise.all(postIds.map(
      post => getPostById(post.id)
    ));

  } catch (error) {
    throw error;
  }
}

const getAllTags = async() => {
  try{
    const { rows } = await client.query(`SELECT * FROM tags;`)
    return rows
  }catch(error){
    console.log('There was an error getting all tags')
    throw(error)
  }
}

async function addTagsToPost(postId, tagList) {
  try {
    const createPostTagPromises = tagList.map(
      tag => createPostTag(postId, tag.id)
    );
    await Promise.all(createPostTagPromises);
    return await getPostById(postId);
  } catch (error) {
    throw error;
  }
}




const getPostById = async (postId) => {

  // console.log('postId', postId);

  try {
    const {
      rows: [post],
    } = await client.query(
      `
      SELECT *
      FROM posts
      WHERE id=$1;
    `,
      [postId]
    );

    if (!post) {
      throw {
        name: "PostNotFoundError",
        message: "Could not find a post with that postId"
      };
    }

    // console.log('these post', post);

    const { rows: tags } = await client.query(
      `
      SELECT tags.*
      FROM tags
      JOIN post_tags ON tags.id=post_tags."tagId"
      WHERE post_tags."postId"=$1;
    `,
      [postId]
    );

    const {
      rows: [author],
    } = await client.query(
      `
      SELECT id, username, name, location
      FROM users
      WHERE id=$1;
    `,
      [post.authorId]
    );

    post.tags = tags;
    post.author = author;

    delete post.authorId;

    return post;
  } catch (error) {
    throw error;
  }
};


const getUserByUserName = async(username) => {
  try {
    const {rows: [user]} = await client.query(`
    SELECT * FROM users
    WHERE username=$1;
    `, [username])
    return user
  }catch(error) {
    console.log("There was an error getting user by username")
    throw error
  }
}


module.exports = {  
  client,
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  createTags,
  createPostTag,
  addTagsToPost,
  getPostsByTagName, 
  getAllTags, 
  getUserByUserName
} 