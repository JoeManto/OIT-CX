import React from 'react';
import '../css/AdminPage.css';
import '../css/util.css';
import {DatePicker} from './PostShiftPage.js';
import {getCookie} from './Authentication'
import {checkWindowHeight} from './Util'
import {adminOperation,getUsers,getPositionsForUser} from "./DataFetchHandler";
import {Header} from "./WaitList";

/**
 *[BLOCK TYPE]
 * This the data that is inserted into a block component
 *
 * @type {
 * {headerData:
 * {    subTitle: string, The subtitle for the header
 *      title: string, The title for the header
 *      contentKeyNames: string[]all the key names for the editable data below the header
 * },
 * endPoint: string, the endpoint on server that correctly maps the inputs into an sql expression
 * confirmMessage: string, Message after successful api call
 * ContentData: *[], dynamic editable content
 * name: string, name of the block
 * errorMessage: string, Message displayed on an error
 * type: string, The type of block
 * key: number block index
 * }[]}
 */
const blocks = [
    {
        name: "add-user",
        type: "ContentBlock",
        key: 0,
        endPoint: "/addUser",
        confirmMessage: "User successfully added",
        errorMessage: "Input values are not valid",
        headerData:
            {
                title: "Add User",
                subTitle: "Enter the following information about the user below.",
                contentKeyNames: ["date", "bnid", "fstName", "pos","role"],
            },
        ContentData:
            [
                {
                    labelVal: "Start Date",
                    comp: {type: "date", index: 0},
                    subLabelVal: "The start date represents the day that the user will be added into the data base."
                },
                {
                    labelVal: "BNID",
                    comp: {type: "input", placeholder: "jfj5666", index: 1},
                    subLabelVal: "The Bronco NetID of the user to be added.",
                },
                {
                    labelVal: "First Name",
                    comp: {type: "input", placeholder: "Joseph", index: 2},
                    subLabelVal: "This is the preferred first name of the user. If blank the LDAP first name will be selected",
                },
                {
                    labelVal: "Position",
                    comp: {type: "select", options: "positionData", index: 3},
                    subLabelVal: "",
                },
                {
                    labelVal: "Role",
                    comp: {type: "select", options: ["", "Student", "Supervisor"], index: 4},
                    subLabelVal: "",
                },
            ]
    },
];

/**
 * Uses 2 prop values to render the main header for each block
 * @param props [title:string,subtitle:string]
 * @returns {*} Rendered Header
 * @constructor -
 */
function HeaderContainer(props) {
    return (
        <div className={"headerTitleCnt"}>
            <h3>{props.title}</h3>
            <p>{props.subtitle}</p>
        </div>
    );
}

/**
 * Block @type REACT COMP
 *
 * Renders out the child views of the block content and the header. This parent component uses the block obj that
 * is passed in as a prop for describing how the block's editable content and header is going to be rendered.
 */
class Block extends React.Component {
    constructor(props) {
        super(props);
        let inputValues = [];
        if (this.props.data) {
            //Push "" or (empty values) values
            for (let i = 0; i < this.props.data.ContentData.length; i++) {
                if (this.props.data.ContentData[i].comp.type === "date") {
                    inputValues.push(new Date())
                } else {
                    inputValues.push("");
                }
            }
        }
        this.state = {
            positionData:[""],
            inputValues: inputValues,
            error: {status: "untested", message: ""},
            showProgress: false,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
    }

    componentWillMount() {
        getPositionsForUser(true)
            .then((positionData)=>{
                this.setState({positionData:[" ",...positionData.res]});
            }).catch(err=>console.log(err));
    }

    /*All functions below are event handlers for the onChange call back for all the editable components.
    * all of which change their input value in the array (inputValues). The index that is changed is determined based on
    * the components name property which is defined on creation or in the block obj*/

    /**
     * Event Handler for the all the date elements
     * @param e React Wrapper Event (NO synthetic events)
     */
    handleDateChange = (e) => {
        let inputValues = this.state.inputValues;
        inputValues[e.event.currentTarget.name] = e.date;
        this.setState({inputValues: inputValues});
    };

    /**
     * Event Handler for the all the text input elements
     * @param e React Wrapper Event (NO synthetic events)
     */
    handleInputChange = (e) => {
        let inputValues = this.state.inputValues;
        inputValues[e.target.name] = e.target.value;
        this.setState({inputValues: inputValues});
    };

    /**
     * Event Handler for the all the select elements
     * @param e React Wrapper Event (NO synthetic events)
     */
    handleSelection = (e) => {
        let inputValues = this.state.inputValues;
        inputValues[e.name] = e.value;
        this.setState({inputValues: inputValues});
    };

    /**
     * Event Handler for the all the submit requests from the submit button
     * @param e React Wrapper Event (NO synthetic events)
     */
    handleSubmit = async () => {
        this.setState({showProgress: true});
        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(2000);

        let values = this.state.inputValues;

        console.log("values : "+values);

        let errorStatus = {status: "confirmed", message: this.props.data.confirmMessage};
        for (let i = 0; i < values.length; i++) {
            if (values[i] === "") {
                errorStatus = {status: "error", message: this.props.data.errorMessage};
                break;
            }
        }
        if (errorStatus.status === "confirmed") {
            adminOperation(this.props.data.endPoint, this.props.data.headerData.contentKeyNames, this.state.inputValues)
                .then(_ => {
                    this.setState({showProgress: false, error: errorStatus});
                })
                .catch((obj) => {
                    errorStatus = {status: "error", message: "Error when creating user. Please make sure the user doesn't already exist"};
                    this.setState({showProgress: false, error: errorStatus});
                })
        } else {
            this.setState({showProgress: false, error: errorStatus});
        }
    };
    /**
     * Returns the jsx for the correct editable component
     * @param data the current component in the block obj
     * @returns {*} jsx object
     */
    getCompForType = (data) => {
        switch (data.type) {
            case "date":
                return (<DatePicker onChange={this.handleDateChange} name={data.index}/>);
            case "input":
                return (<input onChange={this.handleInputChange}
                               style={{margin: "auto 0", marginLeft: "10px"}}
                               value={this.state.inputValues[data.index]}
                               name={data.index}
                               className={"inputBox-1-normal"}
                               placeholder={data.placeholder} type="text"/>);
            case "select":
                let mappedData = [""];

                if(data.options === "positionData"){
                    mappedData = this.state.positionData.map((obj,i)=>{
                        return (<option key={i} value={obj.id} id={obj.id}>{obj.posName}</option>);
                    });
                }else{
                    mappedData = data.options.map((obj,i)=>{
                        return (<option key={i} value={i-1} id={obj}>{obj}</option>);
                    });
                }
                return (
                    <select onChange={({nativeEvent: {target}}) => this.handleSelection(target)}
                            style={{margin: "auto 0", marginLeft: "20px"}}
                            value={this.state.inputValues[data.index]}
                            name={data.index}>{mappedData
                        })
                    }
                    </select>
                );
            default:
                return;
        }
    };
    /**
     * Returns all the jsx or editable content that is in the block objs
     * @param contentData the full contentData selection of the current block obj
     * @returns {*} array of jsx block objects
     */
    renderContent = (contentData) => {
        return (
            <div className={"innerElements-cnt"}>
                {contentData.map((block, i) => {
                    return (
                        <div key={i} className={"editElement"}>
                            <div className={"flexRow"}>
                                <h4>{block.labelVal}</h4>
                                {this.getCompForType(block.comp)}
                            </div>
                            <p className={"admin-sub-header marginLess"}>{block.subLabelVal}</p>
                        </div>
                    );
                })}
            </div>
        );
    };
    /**
     * Main render for the current block all the methods above to render the header and the editable content.
     * @returns {null|*}
     */
    render() {
        if (this.props.data) {
            return (
                <div className={"setting-cnt"}>
                    <HeaderContainer title={this.props.data.headerData.title}
                                     subtitle={this.props.data.headerData.subTitle}/>
                    <div className={"editInputCnt"}>
                        {this.renderContent(this.props.data.ContentData)}
                        {this.state.error.status === "error" &&
                        <h5 className={"innerElements-cnt"}>{this.state.error.message}</h5>}
                        {this.state.error.status === "confirmed" &&
                        <h5 className={"innerElements-cnt"}>{this.state.error.message}</h5>}
                        <button onClick={this.handleSubmit}
                                style={{fontWeight: "bolder"}}
                                className={"fadingButtonGrey right"}>Add User
                        </button>
                        {this.state.showProgress &&
                        <div className={"progressAnimated"}/>
                        }
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}
/**
 * BlockController - @type REACT COMP
 *
 * The blockController main job is render out all the blocks and handle and parent related state events.
 * Most of the state events and api calls happen inside the child components and the parent is left static and
 * receives no call backs
 */
export default class BlockController extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            userData:[],
        }
    }
    componentWillMount() {
        getUsers()
            .then((users) => {
                this.setState({userData:users.res})
            })
            .catch(_=>this.setState({userData:[]}));
    }
    render() {
        const inputSearchStyle = {
            width: "20em",
            height: "6.5em",
        };
        return (
            <div>
                <HeaderContainer title={"User Search"} subtitle={"Type in a user's first name, surname or bnid"}/>
                <ExpandableInput data={this.state.userData} style={inputSearchStyle} name={0} placeholder={"jfj5666"}/>
                {blocks.map((obj, i) => {
                    return (<Block key={i} data={obj}/>);
                })}
            </div>
        );
    }

}

/**
 * ExpandableInput @type REACT - COMP
 *
 * Is an extension on top the input element and on each change in the input box the
 * searching function will attempts to find the best matches for the input compared to the 3 fields for matching
 * (bnid,surname,first name). These matches are displayed under the input search box.
 */
export class ExpandableInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            matches: [],
            input: "",
            error: {status: "untested", message: ""}
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    /**
     * Handles all the input changes on the input text box and sets the state for new matches and a new input.
     * @param e React Wrapper Event (NO synthetic events)
     */
    handleInputChange = (e) => {
        let value = e.target.value;
        let matches = this.handleCalcBestMatches(value.toLowerCase());
        let status;
        if (matches.length === 0) {
            status = {status: "error", message: "No users found"};
        }
        if (matches.length > 0) {
            status = {status: "success", message: ""};
        }
        if (value.length === 0) {
            status = {status: "untested", message: "No users found"};
        }
        this.setState({input: value, matches: matches, error: status});
    };

    /**
     * returns jsx objects that span's dark bold letter for the letter that have been typed in the input.
     * the other characters that have not been typed yet but are still in the match are left to the same fontWeight.
     * @param splitString all the characters of the match split into an array
     * @param currentInput the current input of the input box
     * @returns {*} jsx object of the match but with a shit ton of spans.
     */
    formatMatchCharacters(splitString, currentInput) {
        splitString = splitString.map((obj, i) => {
            if (currentInput.charAt(i) === obj) {
                return (<span key={i} style={{fontWeight: "bolder"}}>{obj}</span>);
            } else {
                return (<span key={i} style={{fontWeight: "normal"}}>{obj}</span>);
            }
        });
        return splitString;
    }

    renderOption = (matchedObj) => {
        let style = {
            padding: "10px",
        };

        let input = this.state.input;
        let nameSplit = this.formatMatchCharacters(matchedObj.empyname.split(''), input);
        let sirNameSplit = this.formatMatchCharacters(matchedObj.surname.split(''), input);
        let bnidSplit = this.formatMatchCharacters(matchedObj.empybnid.split(''), input);

        return (
            <div style={style}>
                {nameSplit}, {sirNameSplit} {bnidSplit}
            </div>
        );
    };
    /**
     * Searches for the best matches of the input and returns the matches.
     * Used for setting state.
     * @param value current input value
     * @returns {Array} matches
     */
    handleCalcBestMatches = (value) => {
        let matches = [];

        if(this.props.data && this.props.data.length > 0) {
            let input = value;
            let data = this.props.data.filter(data => data.empyname.charAt(0) === input.charAt(0) ||
                data.empybnid.charAt(0) === input.charAt(0) ||
                data.surname.charAt(0) === input.charAt(0));

            for (let i = 0; i < data.length; i++) {
                let flags = [0, 0, 0];
                for (let x = 0; x < input.length; x++) {
                    if (!flags[0] && x < data[i].empyname.length && data[i].empyname.charAt(x) !== input.charAt(x)) {
                        flags[0] = 1;
                    }
                    if (!flags[1] && x < data[i].surname.length && data[i].surname.charAt(x) !== input.charAt(x)) {
                        flags[1] = 1;
                    }
                    if (!flags[2] && x < data[i].empybnid.length && data[i].empybnid.charAt(x) !== input.charAt(x)) {
                        flags[2] = 1;
                    }
                }

                let sum = 0;
                for (let c = 0; c < flags.length; c++) {
                    if (flags[c]) {
                        sum++;
                    }
                }
                if (sum < 3) {
                    matches.push(data[i]);
                }
            }
        }
        return matches;
    };

    /**
     * Main render method of the input and the match area
     * @returns {*}
     */
    render() {
        checkWindowHeight();
        const state = this.state;
        return (
            <div className={"expandable-inp-cnt"}>
                <input name={this.props.index}
                       value={this.state.input}
                       onChange={this.handleInputChange}
                       className={"inputBox-1-normal"}
                       placeholder={this.props.placeholder}
                       style={this.props.style}
                       type="text"/>

                {state.matches && state.matches.length > 0 && (
                    <div className={"matches-ctn"}>
                        {state.matches.map((obj, i) => {
                            return (<div className={"searchMatch"} key={i}>
                                <div style={{width: "95%"}}>{this.renderOption(obj)}</div>
                                <a className={"matchLink"}>view</a>
                            </div>);
                        })}
                    </div>
                )
                }
            </div>
        );
    }
}
