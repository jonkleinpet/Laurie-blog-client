import React from 'react';

const PostsContext = React.createContext({
  posts: [],
  comments: [],
  user: [],
  isError: false,
  isLoading: false,
  noComments: false,
  blogPost: () => {},
  userLogin: () => {},
  userRegister: () => {},
  commentPost: () => {},
});

export default PostsContext;