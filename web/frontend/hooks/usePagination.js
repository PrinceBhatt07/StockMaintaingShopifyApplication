import { useState, useEffect, useMemo } from "react";

export const usePagination = (filteredData, PageSize) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const currentPageData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * PageSize;
        const lastPageIndex = firstPageIndex + PageSize;
        return filteredData.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, filteredData, PageSize]);

    useEffect(() => {
        const totalPagesRounded = Math.ceil(filteredData?.length / PageSize);
        setTotalPages(totalPagesRounded === 0 ? 1 : totalPagesRounded);
        setCurrentPage(1);
    }, [filteredData, PageSize]);

    const onNext = () => setCurrentPage((prevPage) => prevPage + 1);
    const onPrevious = () => setCurrentPage((prevPage) => prevPage - 1);

    return {
        currentPage,
        totalPages,
        onNext,
        onPrevious,
        currentPageData,
    };
};
