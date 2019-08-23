import React from 'react';
import '../css/LandingPage.css';
import '../css/util.css';
import {IP} from '../js/Util.js';
import {getLastCommit,getContributorsList} from "./DataFetchHandler";
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
                    <div style={{marginTop: '20px'}}/>
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
    constructor(props) {
        super(props);
        this.state = {
            githubData: [],
            githubContribList:[],
            error: "",
            showMoreInfo: false,
        };
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
    }

    componentDidMount() {
        getLastCommit().then(res => {
            this.setState({githubData: res});
        }).catch(e => {
            this.setState({error: e.error});
        });

        getContributorsList().then(res => {
            res = res.filter((obj,i) => i<= 3);
            this.setState({githubContribList: res});
        }).catch(e => {
            this.setState({error: e.error});
        });
    }

    handleMouseEnter = () => {
        this.setState({showMoreInfo: true});
    };

    handleMouseLeave = () => {
        this.setState({showMoreInfo: false});
    };

    render() {
        const state = this.state;
        return (
            <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} id="FooterCont"
                 className={"flexRow"}>
                <p style={{marginRight: "30px"}}>OIT - CX</p>
                <div className={"footerElemCnt flexColumn"}>
                    <a id="footLinks" href={"/Docs"}>Docs</a>
                </div>
                <div className={"footerElemCnt flexColumn"}>
                    <a id="footLinks" href={"https://github.com/JoeManto/OIT-CX"}>Contribute <span role={"img"}>👻</span></a>
                </div>
                <div className={"footerElemCnt flexColumn"}>
                  {state.error !== "" || !this.props.showgitcont ? (
                        <p id="footLinks">Maintained by: Joe.m.manto@wmich.edu</p>
                      ):(
                        <div className={"flexRow"}>
                        <p id="footLinks">Contributors</p>
                        {this.state.githubContribList.map((obj,i)=>{
                          return (<img src={obj} alt={"githubImage"} height={25} width={25}/>);
                        })}
                        </div>
                      )
                  }
                  <p id="footLinks">Wait-List v1.0 &copy; 2019 OIT MIT Licence</p>
                </div>
                {state.error !== "" ? (
                    <div className={"footerElemCnt flexColumn"}>
                        {state.error}
                    </div>
                 ):([
                        (this.props.showgitstatus && state.showMoreInfo && (
                            <div className={"footerElemCnt flexColumn"}>
                                <div className={"flexRow"}>
                                    <img src={state.githubData.profileImgUrl} alt={"profile-pic"} height={25}
                                         width={25}/>
                                    <p id="footLinks"
                                       style={{marginRight: "10px", fontWeight: "normal"}}>{state.githubData.author}</p>
                                    <p id="footLinks">{new Date(state.githubData.date).toDateString()}</p>
                                </div>
                                <p id="footLinks">{state.githubData.message}...</p>
                            </div>
                        ))
                    ]
                )}
            </div>
        );
    }
}

class LandingPage extends React.Component {
    render() {
        return (
            <div id="body">
                <LandingSignIn/>
                <Footer showgitcont={true} showgitstatus={true}/>
            </div>
        );
    }
}

export default LandingPage;
