/* eslint-disable react-hooks/exhaustive-deps */
// src/ProjectPriority.js
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const Test = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projectPriorities, setProjectPriorities] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState([]);

  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 2;
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'Descending';

  // Predefined list of names for filtering (this could be fetched from the server)
  const nameOptions = ['High', 'Medium', 'Low'];

  const fetchProjectPriorities = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/v1/projectPriority/all-projectPriority', {
        params: {
          page,
          limit,
          search,
          sort,
          nameFilter: nameFilter.length > 0 ? nameFilter : undefined,
        },
      });
      setProjectPriorities(response.data.projectPriority);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching project priorities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectPriorities();
  }, [searchParams, nameFilter]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev), // Preserve existing search params
      search: value,
      page: 1, // Reset to first page
    }));
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev), // Preserve existing search params
      sort: newSort,
      page: 1, // Reset to first page
    }));
  };

  const handleNameFilterChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setNameFilter(value);
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev), // Preserve existing search params
      nameFilter: value.length > 0 ? value : undefined,
      page: 1, // Reset to first page
    }));
  };

  const handleLimitChange = (e) => {
    const newLimit = e.target.value;
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev), // Preserve existing search params
      limit: newLimit,
      page: 1, // Reset to first page
    }));
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev), // Preserve existing search params
      page: newPage,
    }));
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="page-wrapper">
      <div className="content" id="exportProjectList">
        <div className="container mt-5 mb-5">
          <h1 className="mb-4">Project Priorities</h1>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="sortSelect" className="form-label">Sort By:</label>
            <select id="sortSelect" className="form-select" value={sort} onChange={handleSortChange}>
              <option value="Ascending">Sort Ascending</option>
              <option value="Descending">Sort Descending</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="nameFilter" className="form-label">Select Name Filter:</label>
            <select id="nameFilter" className="form-select" multiple value={nameFilter} onChange={handleNameFilterChange}>
              {nameOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="limitSelect" className="form-label">Items per Page:</label>
            <select id="limitSelect" className="form-select" value={limit} onChange={handleLimitChange}>
              <option value="2">2</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center">
              <p>Loading...</p>
            </div>
          ) : (
            <ul className="list-group mb-4">
              {projectPriorities.map((priority) => (
                <li key={priority._id} className="list-group-item">
                  <h2 className="h5">{priority.name}</h2>
                  <p>{priority.description}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="d-flex justify-content-between">
            <button
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="btn btn-secondary"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;