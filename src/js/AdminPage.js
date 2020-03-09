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
			<p style = {{color:'darkgrey'}}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
			 standard dummy text ever since the 1500s.>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
			  industry's standard dummy text ever since the 1500s.</p>

            {this.state.isFetchingData ? (
                <h2>fetching data</h2>
            ):(
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
