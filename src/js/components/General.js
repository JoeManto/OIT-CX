import React from 'react';
import rightArrow from '../../rightArrow.png'

export function ArrowButton(props){
    const arrowStyle = {
        height:'30px',
        width:'25px',
        marginLeft:'10px'
    }
    return (
      <Flex>
          <label style = {{marginTop:'5px'}}>{props.btnText}</label>
          <img style = {arrowStyle} src = {rightArrow}></img>
      </Flex>
    )
}

export function Flex(props) {
    const flexStyle = {
      display: "flex",
      flexDirection: props.direction
    };
  
    Object.assign(flexStyle, props.style);
  
    return <div style={flexStyle}>{props.children}</div>;
}

export function Button(props) {
    return (
        <button 
        style = {props.style}
        className={"btn-1"}
        onClick={e => {
            props.onClick(e);
        }}
        >
        {props.btnText}
        </button>
    );
}

export class CountDownMessage extends React.Component {
      constructor(props){
          super(props);

          this.state = {
              count:this.props.count,
          }
      }

      componentDidMount(){
          this.myInterval = setInterval(() => {
              let count = this.state.count;

              if(count === 0){
                  this.props.onCompletion();
                  clearInterval(this.myInterval);
              }else{
                  this.setState({count:this.state.count-1});
              }
          }, 1000);
      }
      render(){
          return(
              <div>
                  {this.props.children}
                  <h5>{this.props.message + " " + this.state.count}</h5>
              </div>
              
          )
      }
}