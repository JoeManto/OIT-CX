import React from 'react';
import '../css/ChangeLog.css';
import emailChangeImage from '../update-log-res/update-screenshot-01.png';
import postShiftButtonImage from '../update-log-res/update-screenshot-02.png';
import dayOfTheWeekShifts from '../update-log-res/update-screenshot-03.png';


export default class ChangeLog extends React.Component {
    render(){
        return(
            <div class = {'ChangeLogCnt'}>
                <h1>Change Log for OIT-CX</h1>
                <UpdateHeader date = {'02/15/2020'} updateNumber = {'1'}/>
                <ChangesContainer>

                    <SubHeader text = {'Emails'}/>
                    <ChangeElement title = {'Emails for Shifts being covered'} content = {
                    `
                        Emails will now be sent to the shift requester and the person who picked up a shift.   
                    `
                    }
                    image = {emailChangeImage}/>

                    <ChangeElement title = {'Emails and permanent shifts'} content = {
                    `
                        There is now a item in the details section of the shift email notifications that show if a shift is permanent or not.
                    `
                    }/>
                    <SubHeader text = {'Shifts'}/>
                    <ChangeElement title = {'Shift cards now display the day of the week'} content = {
                    `
                        For normal shifts (open and picked up) the day of the week will be displayed before the numerical date.
                        For permanent shifts the day of the week is the only information displayed in the title.
                    `
                    } image = {dayOfTheWeekShifts}/>

                    <ChangeElement title = {'Fixed a crash on the post shift page'} content = {
                    `
                        Hovering over the footer will no longer crash the page.
                    `
                    }/>

                    <ChangeElement title = {'Fixed Posting Shift Warnings'} content = {`
                        Long shift time and over night warnings were being displayed when using preset shifts like (mobile and call-in) 
                    `}/>

                    <ChangeElement title = {'Changed the highlight color of shifts'} content = {
                    `
                        The highlight color when hovering over a shift in the shifts page is now a darker appearance rather than a lighter appearance.
                    `
                    }/>

                    <ChangeElement title = {'Changed the post shift button'} content = {
                    `
                        The post shift button now actually looks like a button.
                    `
                    } image = {postShiftButtonImage}/>


                    <SubHeader text = {'Other Changes and Bug Fixes'}/>

                    <ChangeElement title = {'Fixed the text color for input text containers'} content = {
                    `
                        changed the text color for the dark theme style from black to white.
                    `
                    }/>

                
  

                    <ChangeElement title = {'Changed the mobile header background'} content = {
                    `
                        Mobile page headers now reflect the dark theme.
                    `
                    }/>
    
        

                    <ChangeElement title = {'Back-End'} content = {
                    `
                        Various improvements and small bug fixes. 
                        Implemented 30+ unit tests for services and models 
                    `
                    }/>
                    
                    <ChangeElement title = {'Helpdesk Record Merge'} content = {
                    `
                        Fixed a parsing error that caused helpdesk records to not be merged into a legacy table.
                        Implemented unit and integration tests that test this single action and adjacent actions.
                    `
                    }/>
                </ChangesContainer>
            </div>
        );
    }
}

class ChangesContainer extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div class = {'list-cnt'}>
                {this.props.children}
            </div>
        );
    }
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

function SubHeader(props){
    const style = {
        color:'#ffcc33'
    }
    return(
        <h2 style = {style}>{props.text}</h2>
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
