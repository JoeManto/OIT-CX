import React from 'react';
import {Footer} from './LandingPage';
import {getCookie, setCookie} from "./Authentication";
import {apiResponse,BASIC_HEADER,recordFetch,logout} from "./DataFetchHandler";
import {checkWindowHeight,formatAMPM,sqlTimeStampFormat,sqlDateFormat} from "./Util";
import "../css/WaitList.css"
import "../css/util.css"


class CheckIn extends React.Component {
  constructor(props) {
    super(props);
    let locCookie = getCookie('pref-location');

    this.state = {
      locationData:[],
      userLookUp:{status:false,user:"",data:[]},
      selectedLocation:locCookie !== "" ? locCookie:0,
      error:{status:false,message:""},
    }

    this.handleSelection = this.handleSelection.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleReturn = this.handleReturn.bind(this);
  }

  componentWillMount(){
    apiResponse('POST',BASIC_HEADER,
      {
        user: getCookie("user-bnid"),
        key: getCookie("key")
      },'/locations')
      .then((result)=>{
        this.setState({locationData:result.res})
      })
      .catch((e)=>{
        console.log(e);
      })
  }

  requestRecord = (id,locationId) =>{
    apiResponse('POST',BASIC_HEADER,
    {
      user: getCookie("user-bnid"),
      key: getCookie("key"),
      date: sqlTimeStampFormat(),
      customerID: id,
      location: locationId,
    },'/addRec')
    .then(result=>{

    })
    .catch(error=>{

    })
  }

  userSearch = (id) =>{
    apiResponse('POST',BASIC_HEADER,
    {
      user: getCookie("user-bnid"),
      userToLookUp: id,
      key: getCookie("key"),
    },'/searchUser')
    .then((result)=>{
      if(result.error){
        this.setState({error:{status:true,message:"No account found for "+id}})
        return;
      }
      let newUserLookUp = {status:true,user:id,data:result};
      this.requestRecord(newUserLookUp.data.customerID,this.state.selectedLocation);
      this.setState({userLookUp:newUserLookUp});
    })
    .catch((e)=>{
      console.log("error");
      console.log(e);
    })
  }

  renderLocationOptions = () => {
      let elems = [];
      this.state.locationData.map((obj,i)=>{
        elems.push(<option key={i} value={obj.id} id={obj.id}>{obj.locationName}</option>);
      });
      return elems;
  }

  handleSelection = (e) => {
    this.setState({selectedLocation:e.value});
    if(getCookie('pref-location') !== e.value){
      console.log('cookie set');
      setCookie('pref-location',e.value,1);
    }
  }

  handleInputChange = (e) => {
    let tempState = this.state;
    tempState.userLookUp.user = e.value;
    this.setState(tempState);
  }

  handleReturn = (e) => {
    this.setState({
      userLookUp:{status:false,user:"",data:[]},
      error:{status:false,message:""},
    });
  }

  handleSubmit = (e) => {
    if(this.state.userLookUp.user.length === 0){
        this.setState({error:{status:true,message:"Please add a Bronco NetID to search"}});
        return;
    }
    this.userSearch(this.state.userLookUp.user);
  }

  render(){
    return(
      <div>
        {this.state.error.status &&
          <p>{this.state.error.message}</p>
        }
        {!this.state.userLookUp.status &&
          <div id = "checkin-cnt">
          <div className = {"flexColumn"}>
          <input id = "checkin-input" className = {"checkin-elem"} placeholder={"Bronco NetID"} value = {this.state.userLookUp.user} onChange={({nativeEvent: {target}}) => this.handleInputChange(target)} id = "checkin-input"/>
          <select
            className = {"checkin-elem"}
            onChange={({nativeEvent: {target}}) => this.handleSelection(target)}
            value = {this.state.selectedLocation}>
            {
              this.renderLocationOptions()
            }
              </select>
            </div>
            <button id = "checkin-button" style={{fontWeight: "bolder",background:"white"}}
            className={"fadingButtonGrey right"} onClick={this.handleSubmit}>Check In</button>
          </div>
        }
        {this.state.userLookUp.status &&
          <div id = "checkin-cnt">
            <p>User <strong>{this.state.userLookUp.user}</strong> is now checked in</p>
            <button id = "checkin-button" className = {"checkin-elem"} onClick={this.handleReturn}>Go Back</button>
          </div>
        }
      </div>
    );
  }
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
            <td>{formatAMPM(new Date(data.date))}</td>
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
        recordFetch(sqlDateFormat(), getCookie('user-bnid'))
            .then(userRecords => this.setState({userRecords: userRecords["res"]}))
            .catch(err => console.error('error', err.toString()));

        //Gather all records for the day
        recordFetch(sqlDateFormat())
            .then(allRecordsjson => this.setState({allRecordsjson: allRecordsjson["res"]}))
            .catch(err => console.error('error', err.toString()));
    }

    render() {
        checkWindowHeight();
        const dataHeaders = ["Name", "WIN", "BNID", "Fulfilled by", "Time"];
        return (
            <div id="scroll-wrap">
                <div id="header-background"> </div>
                <Header title={"WaitList"}/>
                <div className={"Content"}>
                    <h2 className={"coloredButton"}>CheckIn</h2>
                    <CheckIn/>
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
                <Footer showgitstatus = {true}/>
            </div>
        );
    }
}



export default WaitList;
