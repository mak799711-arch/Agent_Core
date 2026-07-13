'use server';

import { createClient } from '@supabase/supabase-js';
import { Business } from '@/lib/interfaces/business';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getPublicBusinesses(): Promise<Business[]> {
  const { data: businesses, error } = await supabaseAdmin
    .from('businesses')
    .select('*');

  if (error || !businesses) {
    console.error('Error fetching public businesses:', error);
    return [];
  }

  const ownerIds = [...new Set(businesses.map(b => b.owner_id))];
  
  if (ownerIds.length === 0) return [];

  const { data: profiles, error: pError } = await supabaseAdmin
    .from('profiles')
    .select('id, avatar_url, full_name, bio, photos, status')
    .in('id', ownerIds);

  const userMap = new Map();
  if (profiles && !pError) {
    profiles.forEach(p => userMap.set(p.id, p));
  }

  return businesses.map(b => {
    const profile = userMap.get(b.owner_id);
    return {
      id: b.id,
      ownerId: b.owner_id,
      name: b.name || profile?.full_name,
      description: b.description || profile?.bio,
      address: b.address,
      latitude: b.latitude,
      longitude: b.longitude,
      reserveBalance: Number(b.reserve_balance),
      isVerified: b.is_verified || profile?.status === 'verified',
      createdAt: b.created_at,
      avatarUrl: profile?.avatar_url,
      photos: profile?.photos || [],
      fullName: profile?.full_name,
      bio: profile?.bio,
    };
  });
}
