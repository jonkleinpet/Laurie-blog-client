import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import MainPostList from '../components/Main/MainPostList';
import config from '../config';
import AdminRoute from '../components/Routes/AdminRoute';
import PostsContext from '../context/context';
import Navbar from '../components/Navbar/Navbar';
import LoginForm from '../components/LoginForm/LoginForm';
import About from '../components/About/About';
import ErrorBoundary from '../components/Errors/ErrorBoundary';
import RegisterForm from '../components/Register/RegisterForm';
import PostForm from '../components/PostForm/PostForm';
import tokenService from '../services/token-service';
import './App.css';

class App extends Component {
  state = {
    posts: [],
    comments: [],
    user: [],
    images: [],
    isLoggedIn: false,
    isLoading: true,
    isError: false,
    errorMessage: ''
  }

  // toggle login state
  toggleLogout = (loggedOut) => {
    this.setState({ isLoggedIn: loggedOut });
  }

  // POST requests
  blogPost = (content) => {
    return fetch(`${config.API_ENDPOINT}/posts/blog`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "Authorization": `Bearer ${tokenService.getAuthToken()}`
      },
      body: JSON.stringify({ content })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(e => Promise.reject(e));
        }
        return res.json();
      })
      .then(post => {
        console.log(post)
        const newPosts = [...this.state.posts, post];
        this.setState({ posts: newPosts });
  })
    .catch(err => console.error(err.message))
  }
  
 
  commentPost = (content, post_id) => {
   this.setState({isLoading: true})
    fetch(`${config.API_ENDPOINT}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "Application/json",
        Authorization: `Bearer ${tokenService.getAuthToken()}`
      },

      body: JSON.stringify({
        post_id,
        content
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(e => Promise.reject(e));
        }
        return res.json();
      })
      .then(comment => {
        const newComments = [...this.state.comments, comment];
        this.setState({
          comments: newComments
        }, () => {
          this.setState({ isLoading: false })
        });
      })
    
  }

 
  imagePost = (img) => {
    const newImages = [...this.state.images, img];
    this.setState({ images: newImages })
  }
  
  // GET requests
  getAllPosts = () => {
    return fetch(`${config.API_ENDPOINT}/posts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenService.getAuthToken()}`
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(e => Promise.reject(e));
        }
        return res.json();
      })
      .catch(err => console.log(err));
  }


  getAllComments = () => {
    return fetch(`${config.API_ENDPOINT}/comments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenService.getAuthToken()}`
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(e => Promise.reject(e));
        }
        return res.json();
      })
      .catch(err => console.log(err));
  }


  getAllImages = () => {
    return fetch(`${config.API_ENDPOINT}/cloudinary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenService.getAuthToken()}`
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(e => Promise.reject(e));
        }
        return res.json();
      })
      .catch(err => console.log(err));
  }

  // POST auth requests
  userLogin = (name, password) => {
    this.setState({ isError: false, errorMessage: '' });
    return fetch(`${config.API_ENDPOINT}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenService.getAuthToken()}`
      },

      body: JSON.stringify({
        name,
        password
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(e => Promise.reject(e));
        }
        return res.json();
      })
      .then(res => {
        tokenService.saveAuthToken(res.authToken);
        this.setState({ isLoggedIn: true });
      })
      // redirect with user feedback
      .catch(res => {
        this.setState({
          isError: true,
          errorMessage: res.error
        }, () => setTimeout(() => {
          this.setState({ isError: false, errorMessage: '' });
        }, 3000));
      });
  }

  
  userRegister = (user_name, full_name, password) => {
    this.setState({ isError: false, errorMessage: '' })
    return fetch(`${config.API_ENDPOINT}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenService.getAuthToken()}`
      },

      body: JSON.stringify({
        user_name,
        full_name,
        password
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(e => Promise.reject(e));
        }
        return res.json();
      })
      .then(res => {
        this.setState({ isLoggedIn: true }, () => this.userLogin(user_name, password));
      })
      .catch(res => {
        this.setState({
          isError: true,
          errorMessage: res.error
        }, () => setTimeout(() => {
          this.setState({isError: false, errorMessage: ''})
        }, 3000));
      });
  }

  // initial fetch posts and comments
  async componentDidMount() {
    const { comments, user } = await this.getAllComments();
    const posts = await this.getAllPosts();
    const images = await this.getAllImages();
    this.setState({
      posts,
      comments,
      user,
      images,
      isLoading: false
    })
  }
  
  render() {
    
    return (
      <ErrorBoundary>
      <div className='App'>
        <header className='App-header'>
          <Navbar toggleLogout={this.toggleLogout} />
        </header>

        <div className='page-container'>
          <div className='sidebar-container' />
          <div className='main-container'>
            <h1>Welcome to Laurie's Blog</h1>
            <PostsContext.Provider value={this.state}>
              <Route
                exact
                path={"/"}
                render={() => (
                  <MainPostList
                    commentPost={this.commentPost}
                    imagePost={this.imagePost}
                  />
                )}
              />
            </PostsContext.Provider>

            <Route
              exact
              path={"/login"}
              render={() =>
                this.state.isLoggedIn ? (
                  <Redirect to='/' />
                ) : (
                  <PostsContext.Provider value={this.userLogin}>
                    <LoginForm
                      isError={this.state.isError}
                      errorMessage={this.state.errorMessage}
                    />
                  </PostsContext.Provider>
                )
              }
            />

            <PostsContext.Provider value={this.userRegister}>
              <Route
                exact
                path={"/register"}
                render={() =>
                  this.state.isLoggedIn ? (
                    <Redirect to='/' />
                  ) : (
                    <PostsContext.Provider value={this.userRegister}>
                      <RegisterForm
                        isError={this.state.isError}
                        errorMessage={this.state.errorMessage}
                        userLogin={this.userLogin}
                      />
                    </PostsContext.Provider>
                  )
                }
              />
            </PostsContext.Provider>

            <Route path={"/about"} component={About} />

            <PostsContext.Provider value={this.blogPost}>
              <AdminRoute
                path={"/blog"}
                component={ PostForm }
              />
            </PostsContext.Provider>
          </div>
        </div>
        </div>
      </ErrorBoundary>
    );
  }
}

export default App;
