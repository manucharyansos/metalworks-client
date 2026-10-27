const has = (value, key) =>
  Object.prototype.hasOwnProperty.call(value || {}, key)

export function fileAttribute(file, key) {
  return has(file?.pivot, key) ? file.pivot[key] : file?.[key]
}

export function fileDetailsContext(file, orderId) {
  const context = {}
  const values = {
    factory_order_id: file?.pivot?.factory_order_id,
    order_id: orderId,
    revision_id:
      file?.task_file_revision_id || file?.pivot?.task_file_revision_id,
  }
  for (const [key, value] of Object.entries(values)) {
    if (Number.isSafeInteger(Number(value)) && Number(value) > 0)
      context[key] = Number(value)
  }
  return context
}

export function fileDetailsIdentity(file, orderId, workspace, user) {
  return JSON.stringify([
    user?.id,
    user?.role?.name || user?.role,
    user?.factory_id,
    workspace?.company?.id || user?.company?.id,
    workspace?.assignmentId,
    file?.id,
    fileDetailsContext(file, orderId),
  ])
}

export function fileDetailsFallback(file) {
  return {
    original_name: file?.original_name,
    category_name: file?.category?.name,
    is_reference_file: Boolean(
      file?.is_reference_file || file?.category?.is_reference
    ),
    quantity: fileAttribute(file, 'quantity'),
    material_type: fileAttribute(file, 'material_type'),
    thickness: fileAttribute(file, 'thickness'),
    dimensions: fileAttribute(file, 'dimensions'),
    inspection_required: Boolean(
      Number(fileAttribute(file, 'inspection_required') || 0)
    ),
    workshops: [],
  }
}
