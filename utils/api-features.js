class apifeatures{
  constructor(query, querystring) {
    this.query = query;
    this.querystring = querystring;
  }
  filter() {
    const queryobj = { ...this.querystring };
    const exclude = ['page', 'sort', 'limit', 'feilds'];
    exclude.forEach(el => delete queryobj[el]);
    let querystr = JSON.stringify(queryobj);
    querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query=this.query.find(JSON.parse(querystr));
    return this;
  }
  sort() {
     if (this.querystring.sort) {
      const sortby = this.querystring.sort.split(',').join(' ');
      this.query = this.query.sort(sortby);
    }
  else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitfeilds() {
    if (this.querystring.feilds) {
      const feilds = this.querystring.feilds.split(',').join(' ');
      this.query = this.query.select(feilds);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    const page = this.querystring.page * 1 || 1;
    const limit = this.querystring.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    
    return this;
  }
}
module.exports = apifeatures;