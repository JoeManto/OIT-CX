import React from 'react';
import '../css/AdminPage.css';
import '../css/util.css';
import '../css/OperationTutorialView.css';
import {WTInputPanelController,WTInputPanel,Input1,SelectionController} from './components/OperationTutorialView'
import {getPositionsForUser} from './DataFetchHandler'


 export default class AdminPage extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            isFetchingData:true,
            positions:[],
        }
    }

    async componentDidMount(){
        let data = await getPositionsForUser(false);
        data = data.res.map((obj) => obj.posName); 
     
        this.setState({isFetchingData:false,positions:data});
    }

    render(){
        return(
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
                            fields={["helpdesk-stu", "labs-stu", "call-stu"]}
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
                            fields={["helpdesk-stu","labs-stu","calls-stu","classtech"]}
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
                            fields={["helpdesk-stu", "classtech"]}
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
                            fields={["helpdesk-stu", "classtech"]}
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
                    subtitle={"Added the first user into the department"}
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
                            fields={["Help-Desk", "Class Tech", "Operators"]}
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
                    Remove access for all users within a department.	
                    `} 
                    numPanels={1}>

                    <WTInputPanel 
                    title={"Department"} 
                    subtitle={"OIT Department"}>
                        <SelectionController
                            open = {true}
                            fields={["Help-Desk", "Class Tech", "Operators"]}
                        />
                    </WTInputPanel>

                </WTInputPanelController>

                <WTInputPanelController endpoint = {'addPosition'} title = {'Add Position'}
                    description = {`
                    Add a new position to your department.	
                    `} 
                    numPanels={1}>

                    <WTInputPanel 
                    title={"Department"} 
                    subtitle={"OIT Department"}>
                        <SelectionController
                            open = {true}
                            fields={["Help-Desk", "Class Tech", "Operators"]}
                        />
                    </WTInputPanel>

                    <WTInputPanel
                    title={"Position Name"}
                    subtitle={"eg. Walk-In"}
                    >
                        <Input1 title={"Name"} />
                    </WTInputPanel>
                </WTInputPanelController>

                <WTInputPanelController endpoint = {'removePosition'} title = {'Remove Position'}
                    description = {`
                    Remove a position from your department.
                    `} 
                    numPanels={2}>

                    <WTInputPanel 
                    title={"Department"} 
                    subtitle={"OIT Department"}>
                        <SelectionController
                            open = {true}
                            fields={["Help-Desk", "Class Tech", "Operators"]}
                        />
                    </WTInputPanel>

                    <WTInputPanel 
                    title={"Position"} 
                    subtitle={"OIT Department Position"}>
                        <SelectionController
                            open = {true}
                            fields={this.state.positions}
                        />
                    </WTInputPanel>

                </WTInputPanelController>
                </div>
            )}     
            </div>
        );
    }
}
