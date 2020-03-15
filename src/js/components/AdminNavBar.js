import React from 'react';
import '../../css/components_css/AdminNavBar.css';
import {IP} from '../Util';

export class AdminNavBar extends React.Component {
    render(){
        return (
            <div className = {'nav-cnt'}>
                <Logo/>
                <div className = {'nav-item-cnt'}>
                    <NavItem name = {'Operations'} link = {'/operations'}  />
                    <NavItem name = {'Data Viewing'} link = {'/dataviewing'} />
                    <NavItem name = {'App Settings'} link = {'/appsetings'} />
                </div>
               
            </div>
        );
    }
}

function NavItem(props){

    let isActive = () => {
        return props.link === window.location.pathname; 
    }

    let onLinkClick = () => {
        window.location.href = IP()+props.link;
    }

    return (
        <div className = {'nav-item-cnt'}>
            <button className = {isActive() ? 'nav-item-btn active' : 'nav-item-btn'} onClick = {()=>{onLinkClick()}}>
                {props.name}
            </button>
        </div>
    );
}

function Logo(props) {
    return (
        <div className = {'logo-cnt'}>
            <h4>OIT-CX</h4>
        </div>
    )
}
