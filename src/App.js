import logo from './logo.svg';
import './App.css';
import React, { useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 250px;
  overflow-x: auto;
  white-space: nowrap;
  background-color: pink;
  color: black;
  height: 70px;
  margin-top: 50px;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  ::-webkit-scrollbar {
    display: none;
  }
`;

function App() {
  useEffect(() => {
    function horizontally(event) {
      event = window.event || event;
      let delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
      document.querySelector('#handling').scrollLeft -= (delta * 100);
      event.preventDefault();
    }
    document.querySelector('#handling').addEventListener('wheel', horizontally);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <Container id="handling">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi 
          ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit 
          in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </Container>
      </header>
    </div>
  );
}

export default App;
