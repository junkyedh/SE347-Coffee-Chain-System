import React from 'react';
import './Pagination.scss';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '../Button/Button';
import { cn } from '@/modules/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if we're near the beginning or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis');
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className={cn('pagination', className)} aria-label="Pagination">
      <div className="pagination-list">
        {/* First page button */}
        {showFirstLast && currentPage > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            className="pagination-item"
            aria-label="Go to first page"
          >
            Đầu
          </Button>
        )}

        {/* Previous page button */}
        {showPrevNext && (
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeft />}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-item pagination-prev"
            aria-label="Go to previous page"
          />
        )}

        {/* Page numbers */}
        {visiblePages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <div key={`ellipsis-${index}`} className="pagination-ellipsis">
                <MoreHorizontal />
              </div>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(page)}
              className={cn('pagination-item', {
                'pagination-current': currentPage === page,
              })}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </Button>
          );
        })}

        {/* Next page button */}
        {showPrevNext && (
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRight />}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="pagination-item pagination-next"
            aria-label="Go to next page"
          />
        )}

        {/* Last page button */}
        {showFirstLast && currentPage < totalPages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="pagination-item"
            aria-label="Go to last page"
          >
            Cuối
          </Button>
        )}
      </div>

      {/* Page info */}
      <div className="pagination-info">
        Trang {currentPage} / {totalPages}
      </div>
    </nav>
  );
};

export { Pagination };
