/*
-------------------------------------------------------------

 JEST Spikes - (For Testing)
 These spikes, test the inner workings of Jest and as well test how well Jest and React Testing Library work together.

 [Overview]

 [Spike 1]
 - General Usage of Jest for testing functions

 [Spike 2]
 - Tests the getByTestId() to find `data-testid` attributes in the dom

 [Spike 3]
 - Tests the getByText() func to find any child component has rendered the given text

 [Spike 4]
 - Tests simulation of dom events on components

 [Spike 5]
 - Tests Mock functions in Jest

 [Spike 6]
 - Tests how to test functions that require async capabilities 

 [Spike 7]
 - Tests how jest expects a unit test to throw an exception

 [Spike 8]
 - Tests how jest skips unit tests
 
 [Spike 9]
 - Tests contrapositive unit tests

 [Spike 10]
 - Tests Mock Es6 Class in Jest or Mock Objects 

 [Spike 11]
 - This spike, tests how snapshot testing UI works in jest
-------------------------------------------------------------
*/

import React from "react";
import '@testing-library/jest-dom/extend-expect'
import {cleanup, fireEvent, render} from '@testing-library/react';
import TestRenderer  from 'react-test-renderer';

afterEach(cleanup)


/* [Spike Test 1]
*  This is a basic jest test that explains the most basic principles
*/

//defining a set of functions to test
const functions = {
   add: (num1, num2) => num1 + num2
};

describe('Functions',() => {
   test('Adds 2 + 2 to get 4', () => {
      expect(functions.add(2,2)).toBe(4);
   });
});

/*-----------Jest Spikes 2,3--------------
 * 

 * [Spike Test 2]
 * This spike is the first test in the jest suite
 * This test shows how to use the getByTestId to find `data-testid` attributes in the dom
 *
 * [Spike Test 3]
 * This spike is the second test in the jest suite
 * This spike shows how to use the getByText func to find any child component has rendered the given text
 * 
*/

//Defining a basic React Component
//This component only displays text inside of a div
class Link1 extends React.Component{
   render(){
      return(
          <div data-testid = {'link'}>{this.props.text}</div>
      )
   }
}

//Define a testing suite for jest
describe('Link Component', () => {
   //defining a jest test
   it('should render the component', () => {

      const {getByTestId} = render(<Link1/>);
      expect(getByTestId('link')).toBeInTheDocument();

   });
   it('should render the prop text',() => {

      const {getByText} = render(<Link1 text = "Hello World"/>);
      expect(getByText('Hello World')).toBeInTheDocument();

   });
});

/*---------------Jest spike 4---------------------
* [Spike Test 4]
* This spike demonstrates how to simulate dom events on components
*/

/*  Define a basic react component that is controlled by a simple state attribute 'clicked'
*  This example component renders a button and when it is clicked it is no longer rendered.
*/
class Button extends React.Component {
   constructor(props){
      super(props);

      this.state = {
         clicked: false
      };

      this._handleButtonClick = this._handleButtonClick.bind(this);
   }

   _handleButtonClick = () =>{
      this.setState({clicked:!this.state.clicked});
   };

   render() {
      if(this.state.clicked === false)
         return <button data-testid = {'button'} onClick={()=>{this._handleButtonClick()}}>Please Click This Button</button>;
      return null;
   }
}

describe('Button Component', () => {

   it('Should Render',() => {
      const {getByTestId} = render(<Button/>);
      expect(getByTestId('button')).toBeInTheDocument();
   });

   it('Should Disappear After a click',() => {
      const {getByTestId,queryByText} = render(<Button/>);

      //simulate the dom click element
      fireEvent.click(getByTestId('button'));

      //Need to use *query* here as query returns null and the others just throw an error to the test
      expect(queryByText('Please Click This Button')).toBeNull();

   });

});

//---------------Jest spike 5---------------------
/*
*  [Spike Test 5]
*   
*  Mock functions in Jest
*/

//Example function to test
function forEach(items,callback){
   for (let index = 0;index < items.length; index++) {
      callback(items[index]);
   }
}

//define a jest mock function call back object
var mockCallBack = jest.fn(x => 42 + x);

describe('For Each Function', () => {

   //call the function with our mock function object
   forEach([0,1],mockCallBack);

   it('should run 2 times', () => {
      //The number of time this function was ran
      expect(mockCallBack.mock.calls.length).toBe(2);
      
   });

   it('return 42 on the first return', () => {
      expect(mockCallBack.mock.results[0].value).toBe(42);
   })

   it('return 43 on the second return', () => {
      expect(mockCallBack.mock.results[1].value).toBe(43);
   })  
});

//---------------Jest spike 6---------------------
/*
*  [Spike Test 6]
*   
*  This jest spike tests how functions that return promises should be tested
*/

let delay = (ms) => {
   return new Promise((resolve,reject) => {
      setTimeout(()=>{resolve(5)},ms);
   }); 
}  


describe('Delay Function', () => {
   it('Should wait 0.5 seconds', async() => {
      let res = await delay(500);
      expect(res).toBe(5);
   })
});

//---------------Jest spike 7---------------------
/*
   [Spike Test 7]

   This spike tests how a Jest test can expect an exception to be thrown

*/

//define basic function that throws when input is equal to 5
const throwWhenEqualTo5 = (num) => {
   if (num === 5){
    throw "Number can't be 5";
   }
   return 1; 
}

describe('Exception Function',() => {
   it('Should throw when num is 5', () => {
      expect(() => throwWhenEqualTo5(5)).toThrowError("Number can't be 5");
   })
})

//------------Jest spike 8---------------------
/*
   [Spike Test 8]

   This spike, tests how to skip a unit test
*/

describe.skip('Skipping',()=>{
   it('Should skip', () => {
      expect(true).toBeTruthly()
   });
})

//------------Jest spike 9---------------------
/*
   [Spike Test 9]

   This spike, tests how to test for the contrapositive
*/

let capFirstLetter = (name) => {
  
    if(name[0] > 'Z'){
       let newName = name.split('');
       newName[0] = String.fromCharCode(name.charCodeAt(0) - 32);
       return newName.join('');
    }
    return name;
 }

describe('Contrapositive function',() => {
   it('Should not be equal to joe', () => {
      expect(capFirstLetter('joe')).not.toEqual('joe');
   })
})

//------------Jest spike 10---------------------
/*
   [Spike Test 10]

   This spike, tests how mock objects work in jest
*/
class SoundPlayer {
   constructor(){

   }
   play(file){
      console.log("now playing "+ file);
   }
}
class SoundPlayerCustomer {
   constructor(){
      this.soundPlayer = new SoundPlayer();
   }
   playFavSound(){
      this.soundPlayer.play('FavSong.mp3');
   }
}

//jest.mock('SoundPlayer');

describe.skip('SoundPlayerCustomer',() => {
   it('Should Call The Sound Player Constructor',() => {
      const newSoundPlayerCustomer = new SoundPlayerCustomer();
      expect(SoundPlayer).toHaveBeenCalledTime(1);
   });

   it('Should Call Play In The Sound Player Class', () => {
      SoundPlayer.mock.clear();

      const newSoundPlayerCustomer = new SoundPlayerCustomer();

      expect(SoundPlayer).toHaveBeenCalledTime(1);

      newSoundPlayerCustomer.playFavSound();

      const mockSoundPlayerInstance = SoundPlayer.mock.instances[0].play;
      
      expect(mockSoundPlayerInstance.calls[0][0]).toEqual('FavSong.mp3');

   });
});

//------------Jest spike 11---------------------
/*
   [Spike Test 11]

   This spike, tests how snapshot testing UI works in jest
*/

function Link({name}){
   return(
      <a href = "https://shifts.it.wmich.edu" alt = "">{name}</a>
   );
}

describe('Snapshot testing component', () => {
   it('Should render correctly', () => {
      let tree = TestRenderer
      .create(<Link/>)
      .toJSON()

      expect(tree).toMatchSnapshot();
   })
});
