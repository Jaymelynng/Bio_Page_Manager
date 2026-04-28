import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbCrumb {
  label: string;
  to?: string;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbCrumb[];
  className?: string;
}

/**
 * Reusable breadcrumb for admin pages.
 * Pass items in order, from root to current page. The last item is rendered as the current page.
 *
 * Example:
 *   <AdminBreadcrumb items={[
 *     { label: "Dashboard", to: "/biopage" },
 *     { label: "Admin Panel", to: "/biopage/admin/dashboard-settings" },
 *     { label: "Link Generator" },
 *   ]} />
 */
const AdminBreadcrumb = ({ items, className }: AdminBreadcrumbProps) => {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5 sm:gap-2.5">
              <BreadcrumbItem>
                {isLast || !item.to ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AdminBreadcrumb;
