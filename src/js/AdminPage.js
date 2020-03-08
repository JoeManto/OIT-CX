import React from 'react';
import '../css/AdminPage.css';
import '../css/util.css';
import '../css/OperationTutorialView.css';
import {WTInputPanelController,WTInputPanel,Input1,SelectionController} from './components/OperationTutorialView'


 export default class AdminPage extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        return(
			<div className = "admin-operations-cnt">
			<h1 style = {{fontStyle:'oblique'}}>Operations</h1>
			<p style = {{color:'darkgrey'}}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
			 standard dummy text ever since the 1500s.>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
			  industry's standard dummy text ever since the 1500s.</p>
		
            <div className = "admin-operations-list-cnt">
				<WTInputPanelController endpoint = {'addUser'} title = {'Add User'}
				 description = {`
				 Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.	
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
                            fields={["Help-Desk", "Class Tech", "Operators"]}
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
				 Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.	
				`} 
				numPanels={4}>
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
                            fields={["Help-Desk", "Class Tech", "Operators"]}
                        />
                    </WTInputPanel>

                    <WTInputPanel 
                    title={"Account Status"} 
                    subtitle={"This flag effectively removes a user without removing other data contributions. Note the locked flag will omit the ability to login."}>
                        <SelectionController
							open = {true}
                            fields={["Normal", "Locked"]}
                        />
                    </WTInputPanel>

                    <WTInputPanel
                    title={"User Role"}
                    subtitle={"Assignment of permissions"}
                    >
                        <SelectionController open = {true} fields={["Normal", "Supervisor"]} />
                    </WTInputPanel>
                </WTInputPanelController>

                <WTInputPanelController endpoint = {'Lock User'} title = {'Lock User'}
				 description = {`
				 Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.	
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
                            fields={["Help-Desk", "Class Tech", "Operators"]}
                        />
                    </WTInputPanel>
                </WTInputPanelController>

                <WTInputPanelController endpoint = {'addDepartment'} title = {'Add Department'}
				 description = {`
				 Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.	
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
				 Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.	
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
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.	
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
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.	
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
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.	
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
                    title={"Position"} 
                    subtitle={"OIT Department Position"}>
                        <SelectionController
                            open = {true}
                            fields={["Calls", "Walk-In", "Mobile"]}
                        />
                    </WTInputPanel>

                </WTInputPanelController>
            </div>
			</div>
        );
    }
}
