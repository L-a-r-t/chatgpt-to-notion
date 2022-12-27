import mongoose from "mongoose"

const personSchema = new mongoose.Schema({
  email: {
    type: String,
  },
})

const ownerSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  name: {
    type: String,
  },
  object: {
    type: String,
  },
  type: {
    type: String,
  },
  avatar_url: {
    type: String,
  },
  workspace: {
    type: Boolean,
  },
  person: personSchema,
})

const tokenSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  bot_id: {
    type: String,
    required: true,
  },
  workspace_id: {
    type: String,
    required: true,
  },
  workspace_name: {
    type: String,
  },
  workspace_icon: {
    type: String,
  },
  owner: ownerSchema,
})

const TokenData = mongoose.model("TokenData", tokenSchema)
export default TokenData
