import { FunctionComponent, useState } from "react";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

const SearchBar: FunctionComponent<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "חפש מוצרים..." 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex position-relative">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingRight: searchTerm ? "40px" : "15px" }}
        />
        {searchTerm && (
          <button
            type="button"
            className="btn position-absolute"
            style={{ 
              right: "45px", 
              top: "50%", 
              transform: "translateY(-50%)",
              zIndex: 10,
              border: "none",
              background: "transparent"
            }}
            onClick={handleClear}
            title="נקה חיפוש"
          >
            <i className="fa fa-times text-muted"></i>
          </button>
        )}
        <button 
          className="btn btn-outline-info" 
          type="submit"
          title="חפש"
        >
          <i className="fa fa-search"></i>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;