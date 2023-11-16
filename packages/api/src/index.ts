export class IndentAPI {
  petition: PetitionAPI
  resource: ResourceAPI

  constructor() {
    console.warn('Indent API is currently in private beta, join here: https://indent.com/form/approvals')

    this.petition = new PetitionAPI()
    this.resource = new ResourceAPI()
  }
}

async function beta () {
  return Promise.reject(new Error('Indent API is currently in private beta, join here: https://indent.com/form/approvals'))
}

class PetitionAPI {
  constructor() {}

  async create() { await beta() }
  async get() { await beta() }
  async list() { await beta() }
}

class ResourceAPI {
  constructor() {}

  async create() { await beta() }
  async get() { await beta() }
  async list() { await beta() }
  async update() { await beta() }
  async delete() { await beta() }
}