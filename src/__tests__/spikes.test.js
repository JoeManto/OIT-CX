/*

 JEST Spikes - For Testing

 */

import React from "react";
import '@testing-library/jest-dom/extend-expect'
import {cleanup, fireEvent, render} from '@testing-library/react';


//defining a set of functions to test
const functions = {
   add: (num1, num2) => num1 + num2
};

/* [Spike Test 1]
*  This is a basic jest test that explains the most basic principles
*/
describe('Functions',() => {
   test('Adds 2 + 2 to get 4', () => {
      expect(functions.add(2,2)).toBe(4);
   });
});

/*-----------Jest Spikes 2 and 3--------------
 *
 * [Spike Test 2]
 * This spike is the first test in the jest suite
 * This test shows how to use the getByTestId to find `data-testid` attributes in the dom
 *
 * [Spike Test 3]
 * This spike is the second test in the jest suite
 * This spike shows how to use the getByText func to find any child component has rendered the given text
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

/*---------------------Jest Spike 4---------------------
 *
 * [Spike Test 4]
 * This spike demonstrates how to simulate dom events on components
*/

/* Define a basic react component that is controlled by a simple state attribute 'clicked'
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

   it('Should Render The Button Start',() => {
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




