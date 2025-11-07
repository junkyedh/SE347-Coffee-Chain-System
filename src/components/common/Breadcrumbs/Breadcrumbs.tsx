import React from "react";
import { NavLink } from "react-router-dom";
import { Breadcrumb, Container, Row } from "react-bootstrap";
import "./Breadcrumbs.scss";

export interface Crumb {
  label: string;
  to?: string;    // nếu có => render <NavLink>
}

interface BreadcrumbsProps {
  title: string;
  /** Ví dụ:
   * [
   *   { label: "Trang chủ", to: "/" },
   *   { label: "Menu" }
   * ]
   */
  items: Crumb[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ title, items }) => (
  <>
    <div className="inner-banner-wrap">
      <div className="inner-banner-container">
        <Container>
          <div className="inner-banner-content">
            <h1 className="fs-1 text-white text-uppercase font-bold">
              {title}
            </h1>
          </div>
        </Container>
      </div>
    </div>

    <div className="navbar-link py-1">
      <Container>
        <Row>
          <Breadcrumb>
            {items.map((crumb, idx) => (
              <Breadcrumb.Item
                key={idx}
                active={idx === items.length - 1}
              >
                {crumb.to ? (
                  <NavLink to={crumb.to}>
                    {idx === 0 && (
                      <i className="bi bi-house-door-fill me-1"></i>
                    )}
                    {crumb.label}
                  </NavLink>
                ) : (
                  crumb.label
                )}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Row>
      </Container>
    </div>
  </>
);

export default Breadcrumbs;
