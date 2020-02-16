import React from 'react';
import '../css/ChangeLog.css';
import emailChangeImage from '../update-log-res/update-screenshot-01.png';

export default class ChangeLog extends React.Component {
    render(){
        return(
            <div class = {'ChangeLogCnt'}>
                <Title />
                <UpdateHeader date = {'02/15/2020'} updateNumber = {'1'}/>
                  <ChangesContainer>
                    <ChangeElement title = {'Fixed Posting Shift Warning Bugs'} content = {`
                        Long shift time and over night warnings were being displayed when using preset shifts like (mobile and call-in) 
                    `}/>
                    
                    <ChangeElement title = {'Emails for Shifts being covered'} content = {
                    `
                        Emails will now be sent to the shift requester and the person who picked up a shift.
                        
                    `
                    }
                    image = {emailChangeImage}/>

                    <ChangeElement title = {'Fixed crash on post shift page'} content = {
                    `
                        Hovering over the footer will no longer crash the page.
                    `
                    }/>

                    <ChangeElement title = {'Fixed the text color for input text containers'} content = {
                    `
                        changed the text color for the dark theme style from black to white.
                    `
                    }/>

                    <ChangeElement title = {'Back-End'} content = {
                    `
                        Various improvements and small bug fixes
                    `
                    }/>
                    
                   


                </ChangesContainer>
            </div>
        );
    }
}
/* TEMPLATE FOR ABOVE
<ChangeElement title = {'Emails for Shifts being covered'} content = {
    `
                    
    `
}/>

*/



/*
    Title for changelog
    the version of OIT-CX

    Summary of major changes in this update 
*/
function Title(props){
    return (
        <div>
            <h1>Change Log for OIT-CX</h1>
        </div>
    );
}


function UpdateHeader(props){
    return (
        <div>
            <div class = {'header-details'}>
                <h2 style = {{marginRight:'15px'}}>Update #{props.updateNumber}:</h2>
                <h2>{props.date}</h2>
            </div>
        </div>
    ); 
}

function ChangeElement(props){
    return(
        <div className = {'element-details'}>   
            <h3>&bull; {props.title}</h3>
            <p className = {'element-content'}>{props.content}</p>
            {props.image && 
                <img className = {'image'} src = {props.image}></img>
            }
        </div>
    )
}

class ChangesContainer extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div>
                {this.props.children}
            </div>
        );
    }
}

