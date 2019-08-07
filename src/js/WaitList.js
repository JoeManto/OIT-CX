import React from 'react';
import {Footer} from './LandingPage';
import {getCookie, setCookie} from "./Authentication";
import {recordFetch,logout} from "./DataFetchHandler";
import "../css/WaitList.css"
import "../css/util.css"


/**
 * Returns a checkin view for users
 *  @param {[Obj]} props Component data
 * @constructor -
 */
function Checkin(props) {
    return (
        <div className={"Row-Element"} id={"CheckInCont"}>
            <h3 className={"coloredButton"}>Check In</h3>
            <div id="CheckIn-InputCnt">
                <input id="Check-Input" type={"text"} placeholder={"Bronco-NetID or WIN"}/>
                <button id="CheckIn-Button">Check In</button>
            </div>
        </div>
    )
}

/**
 * Returns the header used throughout the app
 * can handle logout actions
 * @constructor -
 */
export function Header(props) {
    function handleLogout() {
        if (getCookie('user-bnid')) {
            logout().then(()=>{console.log("logout success")}).catch();
            //set the cookie to null so the page will auto redirect
            //to the LandingPage
            setCookie("user-bnid", null, 1);
        }
    }

    return (
        <div id="HeaderCont">
            <h2 style={{fontStyle: "oblique"}} className={"left"}>{props.title}</h2>
            <p onClick={handleLogout} id="logout" className={"right"}>{getCookie("user-bnid")} <a href={"/"}
                                                                                                  style={{color: '#282c34'}}>logout</a>
            </p>
        </div>
    );
}

/**
 * Returns a single non header row for the html table given an array via props
 * @param       {[obj]} props data used for the row
 * @constructor
 */
function Row(props) {
    const data = props.data;
    return (
        <tr>
            <td>{data.name}</td>
            <td>{data.win}</td>
            <td><a href={"https://itdirect.wmich.edu/WorkOrder.do?reqTemplate=1502"} target={"_blank"}>{data.bnid}</a>
            </td>
            <td>{data.empyname}</td>
            <td>{data.date}</td>
        </tr>
    );
}

/**
 * Renders the main tables for 'All today records' and 'All records for a ID'
 * The table rows are jsx returned from sub Component funcions. The table takes an array of dictionary records via props
 * @type {[React-Component]}
 * @extends React.Component
 */
export class Chart extends React.Component {
    //build all the header elements
    renderHeader = () => {
        return (
            <thead>
            <tr>{this.props.dataHeaders.map(function (obj, i) {
                return <td key={i}>{obj}</td>
            })}</tr>
            </thead>
        );
    };
    //build all the record rows
    renderBody = () => {
        return (
            <tbody>{this.props.data.map(function (obj, i) {
                return <Row data={obj} key={i}/>
            })}</tbody>
        );
    };

    render() {
        return (
            <div className={"Table-Cont"}>
                <table>
                    {this.renderHeader()}
                    {this.renderBody()}
                </table>
                <p>Total: {this.props.data.length}</p>
            </div>
        );
    }
}

/**
 * The parent Component for this route
 * the state of this Component fetch and keeps track of all records in the
 * database.
 * @extends React.Component
 */
class WaitList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allRecordsjson: [],
            userRecords: [],
        };
    }

    componentWillMount() {
        //Gather records JUST for a ID
        recordFetch("2008-10-10", "xjk5932")
            .then(userRecords => this.setState({userRecords: userRecords["res"]}))
            .catch(err => console.error('error', err.toString()));

        //Gather all record for the day
        recordFetch("2008-10-10")
            .then(allRecordsjson => this.setState({allRecordsjson: allRecordsjson["res"]}))
            .catch(err => console.error('error', err.toString()));
    }

    render() {
        const dataHeaders = ["Name", "WIN", "BNID", "Fulfilled by", "Time"];
        return (
            <div id="scroll-wrap">
                <div id="header-background"> </div>
                <Header title={"WaitList"}/>
                <div className={"Content"}>
                    <Checkin/>
                    <h2 className={"coloredButton"}>My Records</h2>
                    <Chart dataHeaders={dataHeaders} data={this.state.userRecords}/>
                    <h2 className={"coloredButton"}>All Today</h2>
                    <Chart dataHeaders={dataHeaders} data={this.state.allRecordsjson}/>
                    <p style={{
                        float: "right",
                        marginTop: "-10px",
                        color: "lightgray"
                    }}>{new Date().toLocaleString()}</p>
                </div>
                <Footer/>
            </div>
        );
    }
}

export default WaitList;

function checkWindowHeight() {
    let elem = document.getElementById("HeaderCont");
    window.onscroll = function () {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            elem.style.display = "none";
        } else {
            elem.style.display = "";
        }
    }
}
