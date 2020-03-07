import React from 'react';
import '../../css/components_css/AlertMessage.css';

 export class AlertMessage extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			count: 10,
			shouldShowAlert:true,
			forceClosed:false,
            entered:false,
		};
    }
    
    componentWillUpdate(){
        //Should bring back to life --- should reshow the alert
        //entered is used here to omit the update event when clicked
        if(this.state.count === 0 && !this.state.shouldShowAlert && !this.state.entered){
            this.setState({
                count: 10,
                shouldShowAlert:true,
                forceClosed:false,
                entered:false,
            });
        }
    }

    componentWillUnmount(){
        clearInterval(this.myInterval);
    }

	componentDidMount(){
		this.myInterval = setInterval(() => {
			let count = this.state.count;
			if(count === 0){
				clearInterval(this.myInterval);
				this.setState({shouldShowAlert:false});
			}else{
				if(this.state.entered) return;
				this.setState({count:this.state.count-1});
			}
		}, 1000);
	}

	render(){
		return(
			<div className = { this.state.shouldShowAlert ? "alert-cnt show" : "alert-cnt hide"}
				onMouseEnter = {()=>{this.setState({entered:true})}}
				onMouseLeave = {()=>{this.setState({entered:false})}}
			>
				<div className = "alert-content-cnt">
					{this.state.entered ? (
						<div className = {"alert-band-error growBand"} onClick = {()=>{
                            clearInterval(this.myInterval);
                            this.setState({shouldShowAlert:false,count:0,forceClosed:true});
						}}>
							<p className = {"alert-band-text"}>Close</p>
						</div>
					):(
						<div className = {"alert-band-error"}/>
					)}

					<p className = {"alert-text"}>{this.props.message}</p>
				</div>
			</div>
		)
	}
}
