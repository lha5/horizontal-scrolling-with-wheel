import React, { useEffect } from 'react';
import 'antd/dist/antd.css';
import styled from 'styled-components';
import SelectBox from './SelectBox';

const Container = styled.div`
  width: 500px;
  height: 70px;
  overflow-x: auto;
  white-space: nowrap;
  background-color: pink;
  
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  
  -webkit-transition: background-color 2s;
  ::-webkit-scrollbar {
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: transparent;
  }
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.5);
  }
  ::-webkit-scrollbar-button {
    width: 0;
    height: 0;
    display: none;
  }
`;

const Item = styled.div`
  position: relative;
  width: fit-content;
  background-color: skyblue;

  /* x + y : 인접 선택자. 앞의 요소 바로 뒤에 있는 요소만 선택 */
  /* x ~ y : 앞의 요소 뒤에 있는 요소 모두를 선택함 */
  &:hover ~ .submenu {
    height: 80px;
  }
`;

const SubMenu = styled.div`
  position: absolute;
  width: 250px;
  height: 0;
  background-color: yellow;

  &:hover {
    height: 80px;
  }
`;
const Test = styled.div`
  width: 250px;
  height: 250px;
  border: 1px solid gray;
`;

function App() {
  useEffect(() => {
    function horizontally(event) {
      event = window.event || event;
      let delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
      document.querySelector('#handling').scrollLeft -= (delta * 85);
      event.preventDefault();
    }
    document.querySelector('#handling').addEventListener('wheel', horizontally);
  }, []);

  return (
    <div className="App" style={{ padding: "50px"}}>
        <Container id="handling">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi 
          ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit 
          in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </Container>
        <br />
        <br />
        <Item className="item">Mouse Over Me</Item>
        <SubMenu className="submenu" />
        <Test />
        <br />
        <br />
        <SelectBox />
    </div>
  );
}

export default App;
