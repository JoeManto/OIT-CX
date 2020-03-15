import React from 'react';
import '../../css/components_css/AdminNavBar.css';
import {IP} from '../Util';
import {getCookie} from '../Authentication';

export class AdminNavBar extends React.Component {
    render(){
        return (
            <div className = {'nav-cnt'}>
                <Logo/>
                <div className = {'nav-item-cnt'}>
                    <NavItem name = {'Operations'} link = {'/Operations'}  />
                    <NavItem name = {'Data Viewing'} link = {'/Dataviewing'} />
                    <NavItem name = {'App Settings'} link = {'/Appsetings'} />
                    <button className = {'nav-item-btn'} style = {{marginLeft:'100px'}}>{'logout, '}{getCookie('user-bnid')}</button>
                </div>
            </div>
        );
    }
}

function NavItem(props){

    let isActive = () => {
        let path = window.location.pathname.toLocaleLowerCase();
        let link = props.link.toLocaleLowerCase();

        return path === link; 
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
