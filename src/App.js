//mods imports
import React from 'react';

//page imports
import LandingPage  from './js/LandingPage.js';
import WaitList from "./js/WaitList";
import Documentation from './js/Docs.js';
import OperationPage from './js/OperationsPage.js';
import Shifts from './js/Shifts.js';
import PostShiftPage from './js/PostShiftPage'
import ChangeLog from './js/ChangeLog'
import DataViewingPage from './js/DataViewingPage';
import AppSettingsPage from './js/AppSettingsPage';

//function imports
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import {CookiesProvider } from 'react-cookie';
import {validateCookie} from "./js/Authentication";
import {IP} from "./js/Util";

function ProtectedRoute(props){
    let routePath = validateCookie();
    if(routePath){
        if(routePath.route === IP()+'/'){
            return(<Route path = {"/"} component = {LandingPage}/>);
        }
    }
    return(<Route path = {props.path} component = {props.comp}/>);
}

function App() {
    return (
        <CookiesProvider>
            <Router>
                <div className="App">
                    <Switch>
                        <Route path={"/"} exact component = {LandingPage}/>
                        <ProtectedRoute path = {"/WaitList"} comp = {WaitList}/>
                        <ProtectedRoute path = {"/Docs"} comp = {Documentation}/>
                        <ProtectedRoute path = {"/Operations"} comp = {OperationPage}/>
                        <ProtectedRoute path = {"/Shifts"} comp = {Shifts}/>
                        <ProtectedRoute path = {"/Post-shift"} comp = {PostShiftPage}/>
                        <ProtectedRoute path = {"/ChangeLog"} comp = {ChangeLog}/>
                        <ProtectedRoute path = {"/DataViewing"} comp = {DataViewingPage}/>
                        <ProtectedRoute path = {'/Appsettings'} comp = {AppSettingsPage} />
                    </Switch>
                </div>
            </Router>
        </CookiesProvider>
    );
}


export default App;
