import React, { useState, useMemo } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import "./BranchFilter.scss";

export interface Branch {
    id: number;
    name: string;
    address: string;
    phone: string;
    manager?: {
        id: number;
        name: string;
        phone: string;
    };
}

interface BranchFilterProps {
    branches: Branch[];
    selected: number | "all";
    onChange: (id: number | "all") => void;
}

const BranchFilter: React.FC<BranchFilterProps> = ({
    branches,
    selected,
    onChange,
}) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredBranches = useMemo(() => {
        if (!searchQuery.trim()) return branches;

        const query = searchQuery.toLowerCase();
        return branches.filter(
            (branch) =>
                branch.name.toLowerCase().includes(query) ||
                branch.address.toLowerCase().includes(query)
        );
    }, [branches, searchQuery]);

    const allBranchesOption = {
        id: "all" as const,
        name: "Tất cả chi nhánh",
        count: branches.length,
    };

    return (
        <div className="branch-filter">
            <h4 className="branch-filter__title">Chi nhánh</h4>

            <div className="branch-filter__search">
                <FaSearch className="branch-filter__search-icon" />
                <input
                    type="text"
                    className="branch-filter__search-input"
                    placeholder="Tìm kiếm chi nhánh..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <ul className="branch-filter__list">
                <li
                    className={[
                        "branch-filter__item",
                        selected === "all" ? "active" : "",
                    ].join(" ")}
                    onClick={() => onChange("all")}
                >
                    <span className="icon">🏪</span>
                    <span className="name">{allBranchesOption.name}</span>
                    <span className="count">{allBranchesOption.count}</span>
                </li>

                {filteredBranches.map((branch) => (
                    <li
                        key={branch.id}
                        className={[
                            "branch-filter__item",
                            selected === branch.id ? "active" : "",
                        ].join(" ")}
                        onClick={() => onChange(branch.id)}
                    >
                        <span className="icon">
                            <FaMapMarkerAlt />
                        </span>
                        <div className="branch-filter__info">
                            <span className="name">{branch.name}</span>
                            <span className="address">{branch.address}</span>
                        </div>
                    </li>
                ))}

                {filteredBranches.length === 0 && searchQuery && (
                    <li className="branch-filter__empty">
                        Không tìm thấy chi nhánh nào
                    </li>
                )}
            </ul>
        </div>
    );
};

export default BranchFilter;