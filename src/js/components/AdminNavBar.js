import React from 'react';
import '../../css/components_css/AdminNavBar.css';
import {IP} from '../Util';
import {getCookie} from '../Authentication';
import {logout} from '../DataFetchHandler';

export class AdminNavBar extends React.Component {

    handleLogout () {
        logout();
        window.location.href = IP();
    }

    render(){
        return (
            <div className = {'nav-cnt'}>
                <Logo/>
                <div className = {'nav-item-cnt'}>
                    <NavItem name = {'Operations'} link = {'/Operations'}  />
                    <NavItem name = {'Reporting'} link = {'/Reporting'} />
                    <NavItem name = {'App Settings'} link = {'/Appsettings'} />
                    <button onClick = {()=>{this.handleLogout()}} className = {'nav-item-btn'} style = {{marginLeft:'100px'}}>{'logout, '}{getCookie('user-bnid')}</button>
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
