/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    sort: "Descending",
    page: 1,
    limit: 10,
    dateRange: "",
  });

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setFilters((prev) => ({ ...prev, search: searchValue, page: 1 }));

    if (searchValue.trim() !== "") {
      navigate("/", { state: { query: searchValue } });
    } else {
      navigate("/", { state: { query: "" } });
    };
  };

  return (
    <>
      <input
        className="form-control"
        type="text"
        placeholder="Search Project"
        value={filters.search}
        onChange={handleSearchChange}
      />
    </>
  );
};

export default Search;
