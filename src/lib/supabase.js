import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
  if (error) throw error
  return data
}

export async function getUsage(userId) {
  const month = new Date().toISOString().slice(0, 7)
  const { data } = await supabase.from('usage').select('*').eq('user_id', userId).eq('month', month).single()
  return data || { ideas: 0, scripts: 0, chat: 0, captions: 0 }
}

export async function incrementUsage(userId, type) {
  const month = new Date().toISOString().slice(0, 7)
  const { data: existing } = await supabase.from('usage').select('*').eq('user_id', userId).eq('month', month).single()
  if (existing) {
    await supabase.from('usage').update({ [type]: (existing[type] || 0) + 1 }).eq('id', existing.id)
  } else {
    await supabase.from('usage').insert({ user_id: userId, month, [type]: 1 })
  }
}

export async function saveIdea(userId, idea) {
  const { data, error } = await supabase.from('saved_ideas').insert({ user_id: userId, idea_data: idea }).select().single()
  if (error) throw error
  return data
}

export async function getSavedIdeas(userId) {
  const { data } = await supabase.from('saved_ideas').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return data || []
}

export async function deleteSavedIdea(id) {
  await supabase.from('saved_ideas').delete().eq('id', id)
}
