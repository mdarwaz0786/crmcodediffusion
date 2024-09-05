// /* eslint-disable no-extra-semi */
// import { useState, useEffect } from "react";
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { Link, Navigate, useNavigate } from 'react-router-dom';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
// import { useAuth } from "../src/context/authContext.jsx";
// import Preloader from "../src/Preloader.jsx";

// const formFields = [
//   { name: 'name', type: 'text', label: 'Project Name' },
//   { name: 'projectId', type: 'text', label: 'Project ID' },
//   { name: 'price', type: 'text', label: 'Price' },
//   { name: 'priority', type: 'select', label: 'Priority', options: ['High', 'Medium', 'Low'] },
//   { name: 'start', type: 'date', label: 'Start Date' },
//   { name: 'due', type: 'date', label: 'Due Date' },
//   { name: 'type', type: 'select', label: 'Project Type' },
//   { name: 'customer', type: 'select', label: 'Customer' },
//   { name: 'category', type: 'select', label: 'Project Category' },
//   { name: 'timing', type: 'select', label: 'Project Timing' },
//   { name: 'status', type: 'select', label: 'Project Status' },
//   { name: 'responsible', type: 'select', label: 'Responsible Person', multiselect: true },
//   { name: 'leader', type: 'select', label: 'Team Leader', multiselect: true },
//   { name: 'description', type: 'textarea', label: 'Description' },
// ];

// const EditProject = () => {
//   const id = "66b1ee4189457af0d875feba";
//   const [formData, setFormData] = useState(formFields.reduce((accumulator, { name, multiselect }) => ({ ...accumulator, [name]: multiselect ? [] : "" }), {}));
//   const [dropdownData, setDropdownData] = useState({});
//   const navigate = useNavigate();
//   const { validToken, team, isLoading } = useAuth();
//   const permissions = team?.role?.permissions?.project;

//   useEffect(() => {
//     if (isLoading || !permissions?.update) {
//       return;
//     };

//     const fetchDropdownData = async () => {
//       try {
//         const endpoints = [
//           "/api/v1/customer/all-customer",
//           "/api/v1/projectCategory/all-projectCategory",
//           "/api/v1/projectTiming/all-projectTiming",
//           "/api/v1/team/all-team",
//           "/api/v1/projectStatus/all-projectStatus",
//           "/api/v1/projectType/all-projectType",
//         ];

//         const responses = await Promise.all(endpoints.map((url) => axios.get(url, { headers: { Authorization: validToken } })));
//         const [customer, category, timing, team, status, type] = responses.map((response) => response.data);

//         setDropdownData({
//           customer: customer.customer || [],
//           category: category.projectCategory || [],
//           timing: timing.projectTiming || [],
//           team: team.team || [],
//           status: status.projectStatus || [],
//           type: type.projectType || [],
//         });
//       } catch (error) {
//         console.error("Error while fetching dropdown data:", error.message);
//       };
//     };

//     const setFormDataFromProject = (project) => {
//       const newFormData = formFields.reduce((accumulator, field) => {
//         const { name, multiselect } = field;
//         if (multiselect) {
//           accumulator[name] = project[name]?.map(item => item?._id) || [];
//         } else if (name in project) {
//           accumulator[name] = project[name]?._id || project[name] || "";
//         } else {
//           accumulator[name] = "";
//         };
//         return accumulator;
//       }, {});

//       setFormData(newFormData);
//     };


//     const fetchProjectData = async () => {
//       try {
//         const response = await axios.get(`/api/v1/project/single-project/${id}`, { headers: { Authorization: validToken } });
//         if (response?.data?.success) {
//           if (response?.data?.success) {
//             const project = response.data.project;
//             setFormDataFromProject(project);
//           };
//         };
//       } catch (error) {
//         console.error("Error while fetching project data:", error.message);
//       };
//     };

//     fetchDropdownData();
//     fetchProjectData();
//   }, [id, isLoading, permissions?.update, validToken]);

//   const handleChange = ({ target: { name, value } }) => {
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleMultiSelectChange = (name) => ({ target: { value } }) => {
//     if (value && !formData[name].includes(value)) {
//       setFormData((prev) => ({ ...prev, [name]: [...prev[name], value] }));
//     };
//   };

//   const handleRemoveOption = (name, id) => () => {
//     setFormData((prev) => ({ ...prev, [name]: prev[name].filter((optionId) => optionId !== id) }));
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();

//     const emptyFields = formFields.filter(({ name, multiselect }) => {
//       if (multiselect) {
//         return !formData[name] || formData[name].length === 0;
//       };
//       return !formData[name] || formData[name].trim() === "";
//     });

//     if (emptyFields.length > 0) {
//       toast.error("All fields are required");
//       return;
//     };

//     try {
//       const response = await axios.put(`/api/v1/project/update-project/${id}`, formData, { headers: { Authorization: validToken } });

//       if (response?.data?.success) {
//         toast.success("Project updated successfully");
//         navigate("/");
//       };
//     } catch (error) {
//       console.error("Error while updating project:", error.message);
//       toast.error("Error while updating project");
//     };
//   };

//   if (isLoading) {
//     return <Preloader />;
//   };

//   if (!permissions?.update) {
//     return <Navigate to="/" />;
//   };

//   return (
//     <div className="page-wrapper" style={{ paddingBottom: "1rem" }}>
//       <div className="content">
//         <div className="d-flex justify-content-between">
//           <h4>Edit Project</h4>
//           <Link to="#" onClick={() => navigate(-1)}><button className="btn btn-primary">Back</button></Link>
//         </div>
//         <form onSubmit={handleUpdate}>
//           <div className="row">
//             {
//               formFields.map(({ name, type, label, options, multiselect }) => (
//                 <div className={type === "textarea" || name === "name" ? "col-md-12" : "col-md-6"} key={name}>
//                   <div className="form-wrap">
//                     <label className="col-form-label" htmlFor={name}>{label} <span className="text-danger">*</span></label>
//                     {
//                       type === "textarea" ? (
//                         <ReactQuill
//                           className="custom-quill-editor"
//                           value={formData[name]}
//                           onChange={(value) => handleChange({ target: { name, value } })}
//                           modules={{
//                             toolbar: [
//                               [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
//                               [{ size: [] }],
//                               ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//                               [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
//                               ['link', 'image', 'video'],
//                               ['clean'],
//                             ],
//                           }}
//                           formats={[
//                             'header', 'font', 'size',
//                             'bold', 'italic', 'underline', 'strike', 'blockquote',
//                             'list', 'bullet', 'indent',
//                             'link', 'image', 'video',
//                           ]}
//                           placeholder="Write the description here..."
//                           row={6}
//                         />
//                       ) : type === "select" ? (
//                         multiselect ? (
//                           <div>
//                             <select className="form-select" id={name} onChange={handleMultiSelectChange(name)}>
//                               <option value="">Select</option>
//                               {
//                                 (dropdownData.team || []).filter((item) => !formData[name].includes(item._id)).map((item) => (
//                                   <option key={item._id} value={item._id}>{item.name || item.status}</option>
//                                 ))
//                               }
//                             </select>
//                             <div className="selected-container">
//                               {
//                                 formData[name]?.map((id) => (
//                                   <span key={id} className="selected-item">
//                                     {dropdownData?.team?.find((item) => item._id === id)?.name}
//                                     <button type="button" className="remove-btn" onClick={handleRemoveOption(name, id)}>{"x"}</button>
//                                   </span>
//                                 ))
//                               }
//                             </div>
//                           </div>
//                         ) : (
//                           options ? (
//                             <select className="form-select" id={name} name={name} value={formData[name]} onChange={handleChange}>
//                               <option value="">Select</option>
//                               {
//                                 options.map((option) => (
//                                   <option key={option} value={option}>{option}</option>
//                                 ))
//                               }
//                             </select>
//                           ) : (
//                             <select className="form-select" id={name} name={name} value={formData[name]} onChange={handleChange}>
//                               <option value="">Select</option>
//                               {
//                                 (dropdownData[name] || []).map((item) => (
//                                   <option key={item._id} value={item._id}>{item.name || item.status}</option>
//                                 ))
//                               }
//                             </select>
//                           )
//                         )
//                       ) : (
//                         <input type={type} className="form-control" name={name} id={name} value={formData[name]} onChange={handleChange} />
//                       )
//                     }
//                   </div>
//                 </div>
//               ))
//             }
//           </div>
//           <div className="text-end">
//             <Link to="#" onClick={() => navigate(-1)} className="btn btn-light">
//               Cancel
//             </Link>
//             <button type="submit" className="btn btn-primary">
//               Update
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditProject;
