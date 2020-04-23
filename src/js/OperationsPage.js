import React from 'react';
import '../css/OperationsPage.css';
import '../css/util.css';
import '../css/OperationTutorialView.css';
import {WTInputPanelController,WTInputPanel,Input1,SelectionController} from './components/OperationTutorialView'
import {getPositionsForUser,getAllDepartments,apiResponse, locations} from './DataFetchHandler'
import {AdminNavBar} from './components/AdminNavBar';


 export default class OperationsPage extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            isFetchingData:true,
            positions:[],
            departments:[],
            locations:[],
        }
    }

    async componentDidMount(){
        let resolves = await Promise.all([
            getPositionsForUser(false),
            getAllDepartments(),
            locations(),
        ]);

        resolves[0] = resolves[0].res.map((obj) => obj.posName); 
        resolves[1] = resolves[1].res.map((obj) => obj.groupName);
        resolves[2] = resolves[2].res.map((obj) => obj.locationName);
     
        this.setState({isFetchingData:false,positions:resolves[0],departments:resolves[1],locations:resolves[2]});
    }

    render(){
        return(
            <div>
            <AdminNavBar/>
			<div className = "admin-operations-cnt">
			<h1 style = {{fontStyle:'oblique'}}>Operations</h1>
			<p style = {{color:'darkgrey'}}>The operations below allow you to manage departments and users within OIT-CX. You will only be able to modify data within your current department. Click start on any of the operations listed below to begin making changes.</p>

            {this.state.isFetchingData ? (
                <h2>fetching data</h2>
            ):(
                <div className = "admin-operations-list-cnt">
				<WTInputPanelController endpoint = {'addUser'} title = {'Add User'}
				 description = {`
				 Add a user to your department.
				`} 
				numPanels={3}>
                    <WTInputPanel
                    title={"Bronco Net-ID"}
                    subtitle={"Western Michigan University ID"}
                    >
                        <Input1 title={"Bnid"} />
                    </WTInputPanel>

                    <WTInputPanel 
                    title={"Department"} 
                    subtitle={"OIT Department"}>
                        <SelectionController
							open = {true}
                            fields={this.state.departments}
                        />
                    </WTInputPanel>

                    <WTInputPanel
                    title={"User Role"}
                    subtitle={"Assignment of permissions"}
                    >
                        <SelectionController open = {true} fields={["Normal", "Supervisor"]} />
                    </WTInputPanel>
                </WTInputPanelController>

                <WTInputPanelController endpoint = {'editUser'} title = {'Edit User'}
				 description = {`
				Edit an existing user's information. This user must be in your department. The BNID field will be the user whose information is edited.
				`} 
				numPanels={6}>
                    <WTInputPanel
                    title={"Bronco Net-ID"}
                    subtitle={"Western Michigan University ID"}
                    >
                        <Input1 title={"Bnid"} />
                    </WTInputPanel>

                    <WTInputPanel
                    title={"First Name"}
                    subtitle={"Preferred First Name"}
                    >
                        <Input1 title={"empyname"} />
                    </WTInputPanel>

                    <WTInputPanel
                    title={"Last Name"}
                    subtitle={"Preferred Last Name"}
                    >
                        <Input1 title={"surname"} />
                    </WTInputPanel>

                    <WTInputPanel
                    title={"Email"}
                    subtitle={"Western Michigan Email"}
                    >
                        <Input1 title={"email"} />
                    </WTInputPanel>

                    <WTInputPanel 
                    title={"Department"} 
                    subtitle={"OIT Department"}>
                        <SelectionController
							open = {true}
                            fields={this.state.departments}
                        />
                    </WTInputPanel>

                    <WTInputPanel
                    title={"User Role"}
                    subtitle={"Assignment of permissions"}
                    >
                        <SelectionController open = {true} fields={["Normal", "Supervisor"]} />
                    </WTInputPanel>
                </WTInputPanelController>

                <WTInputPanelController endpoint = {'lockUser'} title = {'Lock User'}
				 description = {`
				Deny a user access to this application. This user must be in your department.
				`} 
				numPanels={2}>
                    <WTInputPanel
                    title={"Bronco Net-ID"}
                    subtitle={"Western Michigan University ID"}
                    >
                        <Input1 title={"Bnid"} />
                    </WTInputPanel>

                    <WTInputPanel 
                    title={"Department"} 
                    subtitle={"OIT Department"}>
                        <SelectionController
							open = {true}
                            fields={this.state.departments}
                        />
                    </WTInputPanel>
                </WTInputPanelController>

                <WTInputPanelController endpoint = {'unlockUser'} title = {'Unlock User'}
				 description = {`
				Allow a user access to this application. This user must be in your department.
				`} 
				numPanels={2}>
                    <WTInputPanel
                    title={"Bronco Net-ID"}
                    subtitle={"Western Michigan University ID"}
                    >
                        <Input1 title={"Bnid"} />
                    </WTInputPanel>

                    <WTInputPanel 
                    title={"Department"} 
                    subtitle={"OIT Department"}>
                        <SelectionController
							open = {true}
                            fields={this.state.departments}
                        />
                    </WTInputPanel>
                </WTInputPanelController>

                <WTInputPanelController endpoint = {'addDepartment'} title = {'Add Department'}
				 description = {`
				Create a new department and assign a department supervisor. This supervisor will be able to add, edit, and lock users within this department.
				`} 
				numPanels={2}>

                    <WTInputPanel
                    title={"Department Name"}
                    subtitle={"eg. Helpdesk"}
                    >
                        <Input1 title={"Name"} />
                    </WTInputPanel>

                    <WTInputPanel
                    title={"Assign Supervisor"}
                    subtitle={"Enter the supervisor's BNID e.g. abc1234"}
                    >
                        <Input1 title={"Bronco ID"} />
                    </WTInputPanel>

                    <WTInputPanel
                    title={"Department Email"}
                    subtitle={"eg. oit-hd-students@wmich.edu"}
                    >
                        <Input1 title={"Email"} />
                    </WTInputPanel>

                </WTInputPanelController>

                <WTInputPanelController endpoint = {'editDepartment'} title = {'Edit Department'}
				 description = {`
				Update department name and email. Edits will be available to your department only.
				`} 
				numPanels={3}>
                    <WTInputPanel 
                    title={"Department"} 
                    subtitle={"OIT Department"}>
                        <SelectionController
							open = {true}
                            fields={this.state.departments}
                        />
                    </WTInputPanel>

                    <WTInputPanel
                    title={"Department Name"}
                    subtitle={"eg. Helpdesk"}
                    >
                        <Input1 title={"Name"} />
                    </WTInputPanel>

                    <WTInputPanel
                    title={"Department Email"}
                    subtitle={"eg. oit-hd-students@wmich.edu"}
                    >
                        <Input1 title={"Email"} />
                    </WTInputPanel>
                </WTInputPanelController>

                <WTInputPanelController endpoint = {'lockDepartment'} title = {'Lock Department'}
                    description = {`
                    Remove access for all non-supervisor users within a department. 	
                    `} 
                    numPanels={1}>

                    <WTInputPanel 
                    title={"Department"} 
                    subtitle={"OIT Department"}>
                        <SelectionController
                            open = {true}
                            fields={this.state.departments}
                        />
                    </WTInputPanel>

                </WTInputPanelController>

                <WTInputPanelController endpoint = {'unlockDepartment'} title = {'Unlock Department'}
                    description = {`
                   Grant access to all users within a department.	
                    `} 
                    numPanels={1}>

                    <WTInputPanel 
                    title={"Department"} 
                    subtitle={"OIT Department"}>
                        <SelectionController
                            open = {true}
                            fields={this.state.departments}
                        />
                    </WTInputPanel>

                </WTInputPanelController>

                <WTInputPanelController endpoint = {'addPosition'} title = {'Add Position'}
                    description = {`
                    Add a new position to your current department.	
                    `} 
                    numPanels={1}>

                    <WTInputPanel
                    title={"Position Name"}
                    subtitle={"eg. Walk-In"}
                    >
                        <Input1 title={"Name"} />
                    </WTInputPanel>
                </WTInputPanelController>

                <WTInputPanelController endpoint = {'removePosition'} title = {'Remove Position'}
                    description = {`
                    Remove a position from your current department.
                    `} 
                    numPanels={1}>

                    <WTInputPanel 
                    title={"Position"} 
                    subtitle={"OIT Department Position"}>
                        <SelectionController
                            open = {true}
                            fields={this.state.positions}
                        />
                    </WTInputPanel>

                </WTInputPanelController>

                <WTInputPanelController endpoint = {'addLocation'} title = {'Add Location'}
                    description = {`
                    Add a new waitlist location.	
                    `} 
                    numPanels={1}>

                    <WTInputPanel
                    title={"Location Name"}
                    subtitle={"eg. Walk-In"}
                    >
                        <Input1 title={"Name"} />
                    </WTInputPanel>
                </WTInputPanelController>

                <WTInputPanelController endpoint = {'removeLocation'} title = {'Remove Location'}
                    description = {`
                    Remove a waitlist location.	
                    `} 
                    numPanels={1}>

                    <WTInputPanel
                    title={"Location Name"}
                    subtitle={"eg. Walk-In"}>
                        <SelectionController
                            open = {true}
                            fields={this.state.locations}
                        />
                    </WTInputPanel>
                </WTInputPanelController>

                <WTInputPanelController endpoint = {'removeDepartment'} title = {'Remove Department'}
                    description = {`
                   Completely remove a department and all users within the department. This operation should only be used for accidentally created departments. WARNING! DATA CANNOT BE RECOVERED! 
                    `} 
                    numPanels={2}>

                    <WTInputPanel 
                    title={"Department"} 
                    subtitle={"OIT Department"}>
                        <SelectionController
                            open = {true}
                            fields={this.state.departments}
                        />
                    </WTInputPanel>

                    <WTInputPanel 
                    title={"Confirm"} 
                    subtitle={"This is a dangerous operation. Do you wish to continue?"}>
                        <SelectionController
                            open = {true}
                            fields={['Yes I understand']}
                        />
                    </WTInputPanel>

                </WTInputPanelController>

                <WTInputPanelController endpoint = {'removeShift'} title = {'Remove Shift'}
                    description = {`
                   Completely remove a shift based on shiftID. Note that you will only be able to remove shifts for your given department.
                    `} 
                    numPanels={2}>

                    <WTInputPanel 
                    title={"ShiftID"} 
                    subtitle={"eg. 224"}>
                        <Input1 title={"ShiftID"} />
                    </WTInputPanel>

                    <WTInputPanel 
                    title={"Confirm"} 
                    subtitle={"This operation can't be un-done. Do you wish to continue?"}>
                        <SelectionController
                            open = {true}
                            fields={['Yes I understand']}
                        />
                    </WTInputPanel>

                </WTInputPanelController>

                </div>
            )}     
            </div>
            </div>
        );
    }
}
