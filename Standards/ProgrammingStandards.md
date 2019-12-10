# Programming Standards
The following Programming Standards must be followed by all Team Members:

## General Standards
----
#### Naming Conventions
- All function names and local variables must use the camelCase naming convention e.g. `function doSomething()`
- All class names and global variables must have the first character capitalized eg `class Solution{...}`
- Constants should be named in all capital letters e.g `CONSTDATA`
- Try to avoid digits within variable names
- All names should be descriptive and meaningful and represent what that variable or function is doing. e.g. `function addTwoInts(a, b)` rather than `function add(a, b)`
- All functions should be visible within one viewing window at standard zoom in visual studio code
    - If a function is larger than this it should be split into smaller functions
 - Variables should not be one character other than indexing variables

#### Indentation and Characters
- Tab spacing set to 4
- CRLF line endings
- UTF-8 character set
- Block Comments Package/Extension should be installed in visual studio code
- Use of white space should be as follows:
    - Use a space after a comma when separating function arguments e.g. `function doSomething(arg1, arg2)`
    - Every nested block of code should be one indent further than the previous

## ReactJS Standards
----
- Try to follow all of **ReactJS Design Principles**. These can be found at the following link: [Design Principles](https://reactjs.org/docs/design-principles.html)
- Any react component that doesn't rely on multiple states should be a simple React component function
-   All React Components functions/classes definitions should start and follow with a capitalized first character for each word
- Components should have a relatively small foot printing. Meaning they should one not be very large and too solve or implement a small feature (see nested Components)

#### Nested Components
Nested components should be used rather than passing in jsx through props in most cases
ex.

- **What not to do**
```javascript
    <TwoColumn left = {[<div>LEFT SIDE</div>]} right = {[<div>Right</div>]} />
```
- **What should be used**
```javascript
    <TwoColumn>
        <div>LEFT SIDE</div>
        <div>RIGHT SIDE</div>
    <TwoColumn>
```
#### React Function Component
Here is an example of what a ES6 React component function should look like.
All react component functions and inner class functions follow ES6 syntax.
-   return JSX only
```javascript
    let Frame = (props) => {
        let {name,lastname} = props
        return (
            //jsx
            <div>{name}{lastname}</div>
        )
    }
```
#### React Class Component
Here is an example of what a React Class Component should look like.
```javascript
    class Frame extends React.Component{
        constructor(props){
            super(props);

            //state goes here
            this.state = {
                value:3,
                ...
            }
        }
        render() return();
    }
```
#### Props Destruction
Prop Destructuring is the process of converting a js object's inner hash table key value pairs into individual local scoped variables.
Prop Destructuring should be used always when there are > 1 number of props.
This allows props to be referenced by name rather than using the root reference from props first.
This process has little impact on performance and is mainly used for readability.

**Prop Destruction in React Functions**
```javascript
    let Frame = (props) => {
        //Props Destructuring
        let {name,lastname} = props
        return (
            //jsx
            <div>{name}{lastname}</div>
        )
    }
```

**Prop Destruction in React Classes**

The process is almost the same as React functions, but instead of destructing to individual variables we just append the hash table from the props object to the class's inner hash table.

Prop destructuring in React classes should only be done in the constructor
of the class in question. It also should be the first thing that is done in the constructor to prevent 
from future errors from a function using pre-destruction references.

```javascript
    class Frame extends React.Component{
        constructor(props){
            super(props);
            
            /*  [Props Destructuring]
            * - this | Frame reference
            * - {props} | Outer Destruction
            * - ['props'] | stealing the hash table
            */
            Object.assign(this,{props}['props']);
            ...
        }

        render(){
            return <div>{this.lastname}</div>
        }
    }
```

#### References
No DOM element should be referenced out side of the React API.
`Document.getElementBy...` should not be used at all as it interferes with the React API.
All element references should be done using React refs in components.

```javascript
    class Frame extends React.Component{
        constructor(props){
            super(props);

            this.link = React.CreateRef();

            this.clickLink = this.clickLink.bind(this);
        }

        clickLink = () => {
            this.link.click();
        }

        render(){
            return(
                <div onClick = {()=>{this.clickLink()}}>
                    <a href = "" ref = {this.link}>
                </div>
            )
        }
    }
```
Notice that a reference is attached to the anchor tag and that reference is used to simulate a click on the anchor when the outside div is 'clicked'

#### Rendering Inline Conditional Statements
Any conditional statements in the render method should only compare changing state values and not any other global variables
```javascript
    Class Frame extends React.Component{
        ...
        render(){
            let state = this.state;
            //One if
            {state.somevalue === 1 &&
                <div>Render Option 1</div>
            }

            //If else
            {state.somevalue === 2 ? 
            (
                <div>Render Option 2</div>
            ):
            (
                <div>Not 2</div>
            )}

            //nested if else
            {this.state.firstRender 
            ? null 
            : ( !this.state.closed ? 
                    this.animateMenu(this.links,"up") : this.animateMenu(this.links,"down")
              )
            }
        }
    }
```

#### React Styling
Follows the normal CSS styling conventions 
Styles that are local to a component should be implemented as javascript object styling. In line style in the jsx block

**Javascript Object Styling**
define all the styling in the render method of the component
```javascript
    render(){
        const divStyle = {
            backgroundColor:'#333',
        }

        return (
            <div style = {divStyle}/>
        )
    }
```

**Inlining to not use**
```javascript
    render(){
        return (
            <div style = {"background-color:#333"}/>
        )
    }
```
**Correct Inlining to use**

use camel case js style 
```javascript
    render(){
        return (
            <div style = {{backgroundColor:"#333"}}/>
        )
    }
```

## ES6+ and Babel
---
All JS based code in both the backend and in the React frontend should follow and use all ES6 Concepts. See: [ES6 Reference](http://es6-features.org/#Constants)

Such Concepts that should be followed are [Spreading Syntax (Array and Object referencing), Arrow Functions, Arrays.map, Arrays.filter] 

Spread Syntax Example - from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax:
```Javascript
let sum = (x, y, z) => return x + y + z;

const numbers = [1, 2, 3];

console.log(sum(...numbers));
// expected output: 6

//Non-ES6
console.log(sum.apply(null, numbers));
// expected output: 6
```

JavaScript Array Filtering Example - from: https://www.geeksforgeeks.org/javascript-array-filter/:
```JavaScript
let isPositive = (value) return value > 0;

var filtered = [112, 52, 0, -1, 944].filter(isPositive);

//JavaScript Arrow Function Example
var filtered = [112, 52, 0, -1, 944].filter(x =>{return x > 0});

print(filtered);

Output: [112, 52, 944]
```

## NodeJS
--- 
All code in the backend should follow all the programming standards listed above in ES6.

**Any backend service should be ideally separated as a child processes**
-   The main thread is reserved for REST API Requests
-   A child process should only use a small amount of resources

## CSS Standards
----
#### General
- Always try to provide fallback properties for older browsers if they are known to be available
- Do not use comments unless the rule specified is unclear at first glance e.g. Some kind of workaround

#### Formatting
- Put spaces before `{` in rule declarations
- Use either hex color codes like `#000` or rgba()
- Follow each CSS rule with a line of whitespace e.g. 
- Use camelCase for all rule names
- Use a space after every `:` inside a rule

Putting these all together will yield the following:
```CSS
#item1 {
    color: #333
}

.selectedItem {
    color: #fff;
    display: block;
}

.testingClass {
    border-radius: 5px;
    background-color: rgba(255,0,0,0.3);   
}
```






