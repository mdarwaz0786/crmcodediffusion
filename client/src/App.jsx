import { Routes, Route } from "react-router-dom";
import Login from "./Components/Login/Login.jsx";
import Logout from "./Components/Logout/Logout.jsx";
import MainPage from "./pages/MainPage/MainPage.jsx";
import ProjectDashboard from "./Components/Dashboard/ProjectDashboard.jsx";
import Project from "./Components/Project/Project.jsx";
import AddProject from "./Components/Project/AddProject.jsx";
import EditProject from "./Components/Project/EditProject.jsx";
import SingleProjectDetail from "./Components/Project/SingleProjectDetail.jsx";
import WorkDetail from "./Components/AddWorkDetail/WorkDetail.jsx";
import AddWorkDetail from "./Components/AddWorkDetail/AddWorkDetail.jsx";
import AddPayment from "./Components/AddPayment/AddPayment.jsx";
import ProjectType from './Components/Project/ProjectType/projectType.jsx';
import AddProjectType from "./Components/Project/ProjectType/AddProjectType.jsx";
import EditProjectType from "./Components/Project/ProjectType/EditProjectType.jsx";
import ProjectCategory from './Components/Project/ProjectCategory/ProjectCategory.jsx';
import AddProjectCategory from "./Components/Project/ProjectCategory/AddProjectCategory.jsx";
import EditProjectCategory from "./Components/Project/ProjectCategory/EditProjectCategory.jsx";
import ProjectStatus from './Components/Project/ProjectStatus/ProjectStatus.jsx';
import AddProjectStatus from "./Components/Project/ProjectStatus/AddProjectStatus.jsx";
import EditProjectStatus from "./Components/Project/ProjectStatus/EditProjectStatus.jsx";
import Customer from './Components/Project/Customer/Customer.jsx';
import AddCustomer from "./Components/Project/Customer/AddCustomer.jsx";
import EditCustomer from "./Components/Project/Customer/EditCustomer.jsx";
import CustomerDetail from "./Components/Project/Customer/CustomerDetail.jsx";
import TeamMember from "./Components/Project/TeamMember/TeamMember.jsx";
import AddTeamMember from "./Components/Project/TeamMember/AddTeamMember.jsx";
import EditTeamMember from "./Components/Project/TeamMember/EditTeamMember.jsx";
import TeamMemberDetail from "./Components/Project/TeamMember/TeamMemberDetail.jsx";
import ProjectTiming from "./Components/Project/ProjectTiming/ProjectTiming.jsx";
import AddProjectTiming from "./Components/Project/ProjectTiming/AddProjectTiming.jsx";
import EditProjectTiming from "./Components/Project/ProjectTiming/EditProjectTiming.jsx";
import ProjectPriority from "./Components/Project/ProjectPriority/ProjectPriority.jsx";
import AddProjectPriority from "./Components/Project/ProjectPriority/AddProjectPriority.jsx";
import EditProjectPriority from "./Components/Project/ProjectPriority/EditProjectPriority.jsx";
import Role from "./Components/Project/Role/Role.jsx";
import AddRole from "./Components/Project/Role/AddRole.jsx";
import EditRole from "./Components/Project/Role/EditRole.jsx";
import Designation from "./Components/Project/Designation/Designation.jsx";
import AddDesignation from "./Components/Project/Designation/AddDesignation.jsx";
import EditDesignation from "./Components/Project/Designation/EditDesignation.jsx";
import TechnologyList from "./Components/Project/Technology/TechnologyList.jsx";
import AddTechnology from "./Components/Project/Technology/AddTechnology.jsx";
import EditTechnology from "./Components/Project/Technology/EditTechnology.jsx";
import InvoiceList from "./Components/Invoice/InvoiceList.jsx";
import AddInvoice from "./Components/Invoice/AddInvoice.jsx";
import SingleInvoice from "./Components/Invoice/SingleInvoice.jsx";
import ProformaInvoiceList from "./Components/ProformaInvoice/ProformaInvoiceList.jsx";
import AddProformaInvoice from "./Components/ProformaInvoice/AddProformaInvoice.jsx";
import SingleProformaInvoice from "./Components/ProformaInvoice/SingleProformaInvoice.jsx";
import Profile from "./Components/Profile/Profile.jsx";
import AttendanceList from "./Components/Attendance/AttendanceList.jsx";
import PurchaseInvoice from "./Components/PurchaseInvoice/PurchaseInvoice.jsx";
import AddPurchaseInvoice from "./Components/PurchaseInvoice/AddPurchaseInvoice.jsx";
import EditPurchaseInvoice from "./Components/PurchaseInvoice/EditPurchaseInvoice.jsx";
import SinglePurchaseInvoice from "./Components/PurchaseInvoice/SinglePurchaseInvoice.jsx";
import ProjectDeployment from "./Components/Project Deployment/ProjectDeployment.jsx";
import AddProjectDeployment from "./Components/Project Deployment/AddProjectDeployment.jsx";
import EditProjectDeployment from "./Components/Project Deployment/EditProjectDeployment.jsx";
import LeaveRequest from "./Components/LeaveRequest/LeaveRequest.jsx";
import Service from "./Components/Service/Service.jsx";
import AddService from "./Components/Service/AddService.jsx";
import EditService from "./Components/Service/EditService.jsx";
import AddOnService from "./Components/AddOnService/AddOnService.jsx";
import AddAddOnService from "./Components/AddOnService/AddAddOnService.jsx";
import EditAddOnService from "./Components/AddOnService/EditAddOnService.jsx";
import CompOff from "./Components/CompOff/CompOff.jsx";
import MissedPunchOut from "./Components/MissedPunchOut/MissedPunchOut.jsx";
import Salary from "./Components/Salary/Salary.jsx";
import PaySalary from "./Components/Salary/PaySalary.jsx";
import SalarySlip from "./Components/Salary/SalarySlip.jsx";
import Holiday from "./Components/Holiday/Holiday.jsx";
import AddHoliday from "./Components/Holiday/AddHoliday.jsx";
import EditHoliday from "./Components/Holiday/EditHoliday.jsx";
import HolidayUpload from "./Components/Holiday/UploadHoliday.jsx";
import Department from "./Components/Project/Department/Department.jsx";
import AddDepartment from "./Components/Project/Department/AddDepartment.jsx";
import EditDepartment from "./Components/Project/Department/EditDepartment.jsx";
import AddNotification from "./Components/Notification/AddNotification.jsx";
import LatePunchIn from "./Components/LatePunchIn/LatePunchIn.jsx";
import AddProjectWork from "./Components/ProjectWork/AddProjectWork.jsx";
import AddTicket from "./Components/Ticket/AddTicket.jsx";
import Ticket from "./Components/Ticket/Ticket.jsx";
import SingleTicket from "./Components/Ticket/SingleTicket.jsx";
import PaymentList from "./Components/Payment/PaymentList.jsx";
import PaymentDetailPage from "./Components/Payment/PaymentDetailPage.jsx";
import Office from "./Components/Office/Office.jsx";
import AddOffice from "./Components/Office/AddOffice.jsx";
import EditOffice from "./Components/Office/EditOffice.jsx";
import SingleOffice from "./Components/Office/SingleOffice.jsx";
import Leeds from "./Components/Leeds/Leeds.jsx";
import SingleLeed from "./Components/Leeds/SingleLeed.jsx";
import Test from "./Test.jsx";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route index element={<ProjectDashboard />} />
          <Route path="client" element={<Customer />} />
          <Route path="add-client" element={<AddCustomer />} />
          <Route path="edit-client/:id" element={<EditCustomer />} />
          <Route path="single-client/:id" element={<CustomerDetail />} />
          <Route path="project" element={<Project />} />
          <Route path="add-project" element={<AddProject />} />
          <Route path="edit-project/:id" element={<EditProject />} />
          <Route path="single-project-detail/:id" element={<SingleProjectDetail />} />
          <Route path="project-deployment" element={<ProjectDeployment />} />
          <Route path="add-project-deployment" element={<AddProjectDeployment />} />
          <Route path="edit-project-deployment/:id" element={<EditProjectDeployment />} />
          <Route path="work-detail" element={<WorkDetail />} />
          <Route path="add-work-detail" element={<AddWorkDetail />} />
          <Route path="add-payment" element={<AddPayment />} />
          <Route path="project-type" element={<ProjectType />} />
          <Route path="add-project-type" element={<AddProjectType />} />
          <Route path="edit-project-type/:id" element={<EditProjectType />} />
          <Route path="project-category" element={<ProjectCategory />} />
          <Route path="add-project-category" element={<AddProjectCategory />} />
          <Route path="edit-project-category/:id" element={<EditProjectCategory />} />
          <Route path="project-status" element={<ProjectStatus />} />
          <Route path="add-project-status" element={<AddProjectStatus />} />
          <Route path="edit-project-status/:id" element={<EditProjectStatus />} />
          <Route path="employee" element={<TeamMember />} />
          <Route path="add-employee" element={<AddTeamMember />} />
          <Route path="edit-employee/:id" element={<EditTeamMember />} />
          <Route path="single-employee/:id" element={<TeamMemberDetail />} />
          <Route path="project-timeline" element={<ProjectTiming />} />
          <Route path="add-project-timeline" element={<AddProjectTiming />} />
          <Route path="edit-project-timeline/:id" element={<EditProjectTiming />} />
          <Route path="role" element={<Role />} />
          <Route path="add-role" element={<AddRole />} />
          <Route path="edit-role/:id" element={<EditRole />} />
          <Route path="designation" element={<Designation />} />
          <Route path="add-designation" element={<AddDesignation />} />
          <Route path="edit-designation/:id" element={<EditDesignation />} />
          <Route path="department" element={<Department />} />
          <Route path="add-department" element={<AddDepartment />} />
          <Route path="edit-department/:id" element={<EditDepartment />} />
          <Route path="technology" element={<TechnologyList />} />
          <Route path="add-technology" element={<AddTechnology />} />
          <Route path="edit-technology/:id" element={<EditTechnology />} />
          <Route path="project-priority" element={<ProjectPriority />} />
          <Route path="add-project-priority" element={<AddProjectPriority />} />
          <Route path="edit-project-priority/:id" element={<EditProjectPriority />} />
          <Route path="invoice" element={<InvoiceList />} />
          <Route path="add-invoice" element={<AddInvoice />} />
          <Route path="single-invoice/:id" element={<SingleInvoice />} />
          <Route path="proforma-invoice" element={<ProformaInvoiceList />} />
          <Route path="add-proforma-invoice" element={<AddProformaInvoice />} />
          <Route path="single-proforma-invoice/:id" element={<SingleProformaInvoice />} />
          <Route path="purchase-invoice" element={<PurchaseInvoice />} />
          <Route path="add-purchase-invoice" element={<AddPurchaseInvoice />} />
          <Route path="edit-purchase-invoice/:id" element={<EditPurchaseInvoice />} />
          <Route path="single-purchase-invoice/:id" element={<SinglePurchaseInvoice />} />
          <Route path="profile" element={<Profile />} />
          <Route path="attendance" element={<AttendanceList />} />
          <Route path="leave-request" element={<LeaveRequest />} />
          <Route path="service" element={<Service />} />
          <Route path="add-service" element={<AddService />} />
          <Route path="edit-service/:id" element={<EditService />} />
          <Route path="add-on-service" element={<AddOnService />} />
          <Route path="add-add-on-service" element={<AddAddOnService />} />
          <Route path="edit-add-on-service/:id" element={<EditAddOnService />} />
          <Route path="comp-off" element={<CompOff />} />
          <Route path="missed-punch-out" element={<MissedPunchOut />} />
          <Route path="late-punch-in" element={<LatePunchIn />} />
          <Route path="salary" element={<Salary />} />
          <Route path="pay-salary/:employeeId/:month/:year/:totalSalary" element={<PaySalary />} />
          <Route path="salary-slip/:employeeId/:month/:year" element={<SalarySlip />} />
          <Route path="holiday" element={<Holiday />} />
          <Route path="add-holiday" element={<AddHoliday />} />
          <Route path="upload-holiday" element={<HolidayUpload />} />
          <Route path="edit-holiday/:id" element={<EditHoliday />} />
          <Route path="send-notification" element={<AddNotification />} />
          <Route path="update-project-status/:id" element={<AddProjectWork />} />
          <Route path="raise-ticket" element={<AddTicket />} />
          <Route path="ticket" element={<Ticket />} />
          <Route path="single-ticket/:id" element={<SingleTicket />} />
          <Route path="payment" element={<PaymentList />} />
          <Route path="single-payment/:id/:txnid" element={<PaymentDetailPage />} />
          <Route path="office" element={<Office />} />
          <Route path="add-office" element={<AddOffice />} />
          <Route path="edit-office/:id" element={<EditOffice />} />
          <Route path="single-office/:id" element={<SingleOffice />} />
          <Route path="leeds" element={<Leeds />} />
          <Route path="single-leed/:id" element={<SingleLeed />} />
          <Route path="test" element={<Test />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </>
  );
};

export default App;