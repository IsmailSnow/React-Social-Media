import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import './App.css';
import  MuiThemeProvider  from '@material-ui/core/styles/MuiThemeProvider'
import  createMuiTheme  from '@material-ui/core/styles/createMuiTheme'
import themeObject from './util/theme';

import home from './pages/home'
import login from './pages/login'
import signup from './pages/signup'
import Navbar from './components/Navbar'

const theme = createMuiTheme(themeObject);

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <Router>
          <Navbar />
          <div className="container">
            <Switch>
              <Route exact path="/" component={home} />
              <Route path="/login" component={login} />
              <Route path="/signup" component={signup} />
            </Switch>
          </div>
        </Router>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
