const pagination = {
    previous: '上一页',
    next: '下一页',
} as const;

export default pagination;
export type PaginationMessages = typeof pagination;
