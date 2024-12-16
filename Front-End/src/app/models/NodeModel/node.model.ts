export interface Node {
  sys_instance_id: string;
  sys_object_id: string;
  org_node_parent: string;
  org_node_left: string | null;
  org_type: string;
  sys_object_name: string;
}
