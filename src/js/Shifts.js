import React from 'react'
import "../css/Shifts.css"
import "../css/util.css"
import {getCookie} from "./Authentication";
import {Footer} from "./LandingPage";
import {Header} from "./WaitList";
import {getPositionsForUser, pickUpShift, deleteShift, shiftFetch} from "./DataFetchHandler";
import {formatAMPM} from "./Util";

function ShiftListItem(props) {
    return (
        <div className={"ShiftListItem"}>
            <h5 className={"shiftListItemHeader"}>{props.header}</h5>
            <div style={{textAlign: "center"}}>{props.objToRender}</div>
        </div>
    );
}

class CoveredShift extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clicked: false,
            pickedUp: false,
            delete: false,
            shiftCleared: "shift-untested",
        };
        this.shiftTimes = {posted: new Date(), start: new Date(), end: new Date()};
        if (props.data) {
            this.shiftTimes.start = new Date(Number(props.data['shiftDateStart']));
            this.shiftTimes.end = new Date(Number(props.data['shiftDateEnd']));
            this.shiftTimes.posted = new Date(props.data['postedDate']);
        }
        this.handleShiftClick = this.handleShiftClick.bind(this);
        this.handleShiftPickUp = this.handleShiftPickUp.bind(this);
        this.handleShiftDelete = this.handleShiftDelete.bind(this);
    }

    handleShiftClick = () => {
        if (this.props.data['coveredBy'] === null) {
            this.setState({clicked: !this.state.clicked})
        }
    };

    getCorrectPosNameFromPosMapping = (positions) => {
        console.log(this.props);
        let shiftType = this.props.data['positionID'];
        let shiftName = "Default";
        for (let i = 0; i < positions.length; i++) {
            if (shiftType === positions[i].id) {
                return positions[i].posName;
            }
        }
        return shiftName;
    };

    handleShiftPickUp = async () => {
        this.setState({pickedUp: true, delete: false});
        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(5000);

        pickUpShift(getCookie("user-bnid"), this.props.data['shiftId'])
            .then(coveredShifts => {
                if (coveredShifts['res'] === "success") {
                    this.setState({shiftCleared: "shift-cleared"});
                } else {
                    this.setState({shiftCleared: "shift-removed"});
                }
            })
            .catch(err => console.error('error', err.toString()));
    };

    handleShiftDelete = async () => {
        this.setState({delete: true, pickedUp: false});
        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(5000);
        deleteShift(getCookie("user-bnid"), this.props.data['shiftId'])
            .then(deleted => {
                if (deleted['res'] === "success") {
                    this.setState({shiftCleared: "shift-cleared"});
                } else {
                    this.setState({shiftCleared: "shift-removed"});
                }
            })
            .catch(err => console.error('error', err.toString()));
        this.setState({shiftCleared: "shift-removed"});
    };

    isOwner = () => {
        return getCookie("user-bnid") === this.props.data['empybnid'] && this.props.data['coveredBy'] === null;
    };

    render() {
        if (this.state.pickedUp) {
            if (this.state.shiftCleared === "shift-untested") {
                return (
                    <div id={"shift-dialog-cnt"} onClick={this.handleShiftClick}
                         className={"contentShifts shadow yellowBordered"}>
                        <div style={{flexDirection: "column"}} className={"shiftFlexCont"}>
                            {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
                            <h3>Hold on, confirming your new shift this will only take a second <span
                                role="img">👍🏽</span></h3>
                            <p>Checking for atomic issues</p>
                        </div>
                    </div>
                );
            } else if (this.state.shiftCleared === "shift-removed") {
                return (
                    <div id={"shift-dialog-cnt"} onClick={this.handleShiftClick}
                         className={"contentShifts shadow yellowBordered"}>
                        <div style={{flexDirection: "column"}} className={"shiftFlexCont"}>
                            {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
                            <h3>It looks like this shift is no longer open or available<span role="img">😲</span>sorry
                            </h3>
                            <p>You are no longer required to show up to this shift</p>
                        </div>
                    </div>
                )
            } else if (this.state.shiftCleared === "shift-cleared") {
                return (
                    <div id={"shift-dialog-cnt"} onClick={this.handleShiftClick}
                         className={"contentShifts shadow yellowBordered"}>
                        <div style={{flexDirection: "column"}} className={"shiftFlexCont"}>
                            {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
                            <h3>Nice, no issues found! Shift confirmed<span role="img">🤖</span>- Thank you</h3>
                            <p>You're all set, just look out for an email with details regarding your new shift!</p>
                        </div>
                    </div>
                )
            }
        }
        if (this.state.delete) {
            if (this.state.shiftCleared === "shift-untested") {
                return (
                    <div id={"shift-dialog-cnt"} onClick={this.handleShiftClick}
                         className={"contentShifts shadow yellowBordered"}>
                        <div style={{flexDirection: "column"}} className={"shiftFlexCont"}>
                            {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
                            <h3>Hold on, confirming the deletion of your shift, this will only take a second <span
                                role="img">👍🏽</span></h3>
                            <p>Checking for atomic issues</p>
                        </div>
                    </div>
                );
            } else if (this.state.shiftCleared === "shift-removed") {
                return (
                    <div id={"shift-dialog-cnt"} onClick={this.handleShiftClick}
                         className={"contentShifts shadow yellowBordered"}>
                        <div style={{flexDirection: "column"}} className={"shiftFlexCont"}>
                            {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
                            <h3>It looks like this shift is no longer open or available<span role="img">😲</span>sorry
                            </h3>
                            <p>The shift was picked up in between the time of posting and removal</p>
                        </div>
                    </div>
                )
            } else if (this.state.shiftCleared === "shift-cleared") {
                return (
                    <div id={"shift-dialog-cnt"} onClick={this.handleShiftClick}
                         className={"contentShifts shadow yellowBordered"}>
                        <div style={{flexDirection: "column"}} className={"shiftFlexCont"}>
                            {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
                            <h3>Nice, no issues while deleting! <span role="img">🤖</span></h3>
                            <p>Your shift posting is removed and no longer visible.</p>
                        </div>
                    </div>
                )
            }
        }
        if (this.state.clicked) {
            return (
                this.isOwner() ?
                    (
                        <div id={"shift-dialog-cnt"} onClick={this.handleShiftClick}
                             className={"contentShifts shadow yellowBordered"}>
                            <div style={{justifyContent: 'center'}} className={"shiftFlexCont"}>
                                {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
                                <h3>Delete this shift? <span role="img">🙇🏽‍♂️</span></h3>
                                <button onClick={this.handleShiftDelete} style={{marginLeft: "50%", marginTop: "15px"}}
                                        className={"fadingButton"}>Delete Shift
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div id={"shift-dialog-cnt"} onClick={this.handleShiftClick}
                             className={"contentShifts shadow yellowBordered"}>
                            <div style={{justifyContent: 'left'}} className={"shiftFlexCont"}>
                                {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
                                <h3>Hello, picking this shift up? <span role="img">🙇🏽‍♂️</span></h3>
                                <button onClick={this.handleShiftPickUp} style={{marginLeft: "50%", marginTop: "15px"}}
                                        className={"fadingButton"}>Pick up
                                </button>
                            </div>
                            <p>Careful no take backs</p>
                        </div>
                    )
            );
        } else {
            return (
                <div onClick={this.handleShiftClick} className={"contentShifts shadow"}>
                    <ShiftListItem header={""} objToRender={
                        <h2>{this.shiftTimes.start.getMonth() + 1}/{this.shiftTimes.start.getDate()}/{this.shiftTimes.start.getFullYear()}</h2>}/>
                    <div className={"shiftFlexCont"}>
                        <ShiftListItem header={"ShiftID"} objToRender={<h3>{this.props.data['shiftId']}</h3>}/>
                        <ShiftListItem header={"Requester"} objToRender={
                            <h3>{this.props.data['empyname']}({this.props.data['empybnid']})</h3>}/>
                        <ShiftListItem header={"Start"} objToRender={<h3>{formatAMPM(this.shiftTimes.start)}</h3>}/>
                        <ShiftListItem header={""} objToRender={<img style={{marginTop: "30px"}} width={25} height={25}
                                                                     src={require('../rightArrow.png')}/>}/>
                        <ShiftListItem header={"End"} objToRender={<h3>{formatAMPM(this.shiftTimes.end)}</h3>}/>
                        <ShiftListItem header={"Type"} objToRender={
                            <h3>{this.getCorrectPosNameFromPosMapping(this.props.posmapping)}</h3>}/>
                        <ShiftListItem header={"Date Posted"} objToRender={
                            <h3>{
                                this.shiftTimes.posted.getMonth() + 1
                            }/{this.shiftTimes.posted.getDate()
                            }/{this.shiftTimes.posted.getFullYear()
                            }:{formatAMPM(this.shiftTimes.posted)}
                            </h3>}/>
                    </div>
                </div>
            );
        }
    }
}

class ShiftsWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            unCoveredShifts: [],
            coveredShifts: [],
            posMapping: [],
        };
        this.renderAllUnCoveredShifts = this.renderAllUnCoveredShifts.bind(this);
    }

    componentWillMount() {
        getPositionsForUser()
            .then((res) => {
                this.setState({posMapping: res.res})
            })
            .catch((err) => {
                console.log("error cant get positions for user:\n" + err)
            });

        shiftFetch(getCookie("user-bnid"), this.props.covered)
            .then(shifts => this.setState({unCoveredShifts: shifts['res']}))
            .catch(err => console.error('error', err.toString()));
    }

    renderAllUnCoveredShifts = () => {
        let elements = [];
        let posMapping = this.state.posMapping;

        // eslint-disable-next-line array-callback-return
        this.state.unCoveredShifts.map(function (obj, i) {
            elements.push(<div key={i} id="shiftCont" className={"Content contentShifts"}>{
                <div>
                    <CoveredShift data={obj} posmapping={posMapping}/>
                </div>}
            </div>);
        });
        return elements;
    };

    render() {
        if (this.state.unCoveredShifts && this.state.unCoveredShifts.length > 0) {
            return (
                <div>
                    {this.renderAllUnCoveredShifts()}
                </div>
            );
        } else {
            // eslint-disable-next-line jsx-a11y/accessible-emoji
            return (<div className={"Content contentShifts"}>{<h3>No Shifts <span role={"img"}>🍺</span></h3>}</div>);
        }
    }
}

export default class Shifts extends React.Component {
    render() {
        return (
            <div id="scroll-wrap">
                <div id="header-background"/>
                <div id = "ShiftWrapper-cnt">
                <Header title={"Shifts"}/>
                <div style={{marginTop:"100px"}}/>
                <div>
                    <div className={"Content contentShifts yellowBottomBordered"}>
                        <h3 style={{color: "black"}}>Open Shifts</h3>
                        <p style={{color: "darkgrey"}}>Click the shifts you wish to interact with</p>
                    </div>
                    <ShiftsWrapper covered={0}/>
                    <div className={"Content contentShifts yellowBottomBordered"}>
                        <h3 style={{color: "black"}}>Picked Up Shifts</h3>
                        <p style={{color: "darkgrey"}}>Just for viewing</p>
                    </div>
                    <ShiftsWrapper covered={1}/>
                </div>
                <Footer/>
                </div>
            </div>
        );
    }
}

