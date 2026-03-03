import type { SupabaseClient } from "@supabase/supabase-js";

function isAlreadyExistsError(message: string) {
  return /already exists|duplicate key/i.test(message);
}

export async function ensurePublicBucket(
  supabase: SupabaseClient,
  bucketName: string
) {
  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    public: true,
  });

  if (createError && !isAlreadyExistsError(createError.message)) {
    throw createError;
  }

  const { data: bucket, error: getError } = await supabase.storage.getBucket(
    bucketName
  );
  if (getError) {
    throw getError;
  }

  if (!bucket.public) {
    const { error: updateError } = await supabase.storage.updateBucket(
      bucketName,
      { public: true }
    );
    if (updateError) {
      throw updateError;
    }
  }
}