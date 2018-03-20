function SubPage(pageIndex, pageSize, totalCount, pageLabelCount) {
        this.pageIndex = pageIndex
        this.pageSize = pageSize
        this.totalCount = totalCount
        this.pageLabelCount = pageLabelCount
    }

    SubPage.prototype = {
        pageIndex: 1, pageSize: 20, totalCount: 0, pageLabelCount: 5,
        getTotalPage: function () {
            return Math.ceil(this.totalCount / this.pageSize) <= 0 ? 1 : Math.ceil(this.totalCount / this.pageSize)
        },
        getPageLabel: function () {
            this.pageIndex = this.pageIndex > this.getTotalPage() ? this.getTotalPage() : this.pageIndex;

            if (this.pageLabelCount == 1) {
                return [this.pageIndex];
            }

            var list = [];
            var startPage = 0;
            var endPage = 0;

            if (this.pageLabelCount == 2) {
                startPage = this.pageIndex == this.getTotalPage() ? this.pageIndex - 1 : this.pageIndex;
                startPage = startPage < 1 ? 1 : startPage;

                endPage = startPage + 1;
                endPage = endPage > this.getTotalPage() ? this.getTotalPage() : endPage;
            }
            else if (this.pageLabelCount % 2 == 0) {
                var labelPage = Math.floor((this.pageIndex - 2) / (this.pageLabelCount - 2)) + 1;

                startPage = (labelPage - 1) * (this.pageLabelCount - 2) + 1;

                startPage = startPage < 1 ? 1 : startPage;
                startPage = startPage > this.getTotalPage() ? this.getTotalPage() : startPage;

                endPage = startPage + this.pageLabelCount - 1;
                endPage = endPage > this.getTotalPage() ? this.getTotalPage() : endPage;
                endPage = endPage < 1 ? 1 : endPage;
            }
            else {
                startPage = this.pageIndex - ((this.pageLabelCount - 1) / 2);
                startPage = startPage < 1 ? 1 : startPage;
                startPage = startPage > this.getTotalPage() ? this.getTotalPage() : startPage;
                endPage = startPage + this.pageLabelCount - 1;
                endPage = endPage > this.getTotalPage() ? this.getTotalPage() : endPage;
                endPage = endPage < 1 ? 1 : endPage;
            }
            for (var i = startPage; i <= endPage; i++) {
                list.push(i);
            }
            return list
        },
        prePage: function () {
            return this.pageIndex > 1 ? this.pageIndex - 1 : 1;
        },
        nextPage: function () {
            return this.pageIndex >= this.getTotalPage() ? this.getTotalPage() : parseInt(this.pageIndex) + 1;
        }

    }
