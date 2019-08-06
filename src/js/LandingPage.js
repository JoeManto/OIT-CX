import React from 'react';
import '../css/LandingPage.css';
import '../css/util.css';
import {IP} from '../js/Util.js';
import {Auth} from '../js/Authentication.js';

class LandingSignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authStatus: "untested",
            error: [],
        };
        this.handleSignIn = this.handleSignIn.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleSignIn = (e) => {
        e.preventDefault();
        const cred = {user: document.getElementById('user').value, pass: document.getElementById('pass').value,};
        if (cred.pass && cred.user) {
            let comp = this;
            Auth(cred)
                .then(function (result) {
                    if (result.status) {
                        if (window.location.href === IP() || window.location.href === IP() + "/") {
                            window.location = IP() + "/WaitList";
                        } else {
                            window.location = window.location.href;
                        }
                    } else {
                        comp.setState({authStatus: "invalid-cred", error: result.error});
                    }
                });
        }
    };

    handleInputChange = (e) => {
        if (this.state.authStatus !== "untested") {
            this.setState({authStatus: "untested"});
        }
        if (e.key === "Enter") {
            if (e.target.id === "user") {
                document.getElementById('pass').focus();
            }
            this.handleSignIn(e);
        }
    };

    render() {
        return (
            <div className={"Flex-Row-Fill Cont"}>
                <div className={"Flex-Column-Center LeftFormCont"}>
                    <h1>Sign In</h1>
                    <p>Sign in with your Bronco NetID</p>
                    <input onChange={this.handleInputChange} onKeyDown={this.handleInputChange} id="user" type={"text"}
                           placeholder={"Bronco-Net ID"}/>
                    <div style={{marginTop: '20px'}}></div>
                    <input onChange={this.handleInputChange} onKeyDown={this.handleInputChange} id="pass"
                           type={"password"} placeholder={"Password"}/>
                    <a onClick={this.handleSignIn} href={"/WaitList"} className={"orange-gradient"} id="signin">Sign
                        In</a>
                    {this.state.authStatus === "invalid-cred" &&
                    <ErrorBanner action={"Error: Auth-session -"} title={this.state.error}/>
                    }
                </div>
                <div className={"Flex-Column-Center RightFormCont orange-gradient"}>
                    <h1>Wait List Sign In</h1>
                    <p>New WMU generic customer tracking web app made by the OIT HelpDesk</p>
                    <h3>Trouble Signing In?</h3>
                    <p>Contact the Help Desk (269) 387-4357</p>
                </div>
            </div>
        );
    }
}

class ErrorBanner extends React.Component {
    render() {
        return (
            <div id="errorCnt">
                <p id="errorTitle">{this.props.action}</p>
                <p style={{fontSize: '.8em'}}>{this.props.title}</p>
            </div>
        );
    }
}

export class Footer extends React.Component {
    render() {
        return (
            <div id="FooterCont">
                <p style={{float: 'right'}}><a href={"/Docs"}>View the Docs &nbsp;&nbsp;&nbsp;</a>
                    <a href={"https://github.com/JoeManto/OIT-CX"}>View The Repo &nbsp;&nbsp;&nbsp;</a>
                    Wait-List v1.0 &copy; 2019 OIT MIT Licence</p>
            </div>
        );
    }
}

function LandingPage() {
    return (
        <div id="body">
            <LandingSignIn/>
            <Footer/>
        </div>
    );
}

export default LandingPage;