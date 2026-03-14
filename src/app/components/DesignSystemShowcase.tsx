import { useState } from 'react';
import { 
  Layers, 
  Save, 
  Trash2, 
  Users, 
  Settings, 
  FileText, 
  MessageSquare,
  Sparkles,
  Plus,
  Edit2,
  Inbox
} from 'lucide-react';
import { UnifiedModal } from './UnifiedModal';
import { UnifiedButton, UnifiedIconButton, UnifiedButtonGroup } from './UnifiedButtons';
import { 
  UnifiedField, 
  UnifiedInput, 
  UnifiedTextarea, 
  UnifiedSelect,
  UnifiedFormGrid,
  UnifiedSection 
} from './UnifiedForm';
import { 
  UnifiedPanel, 
  UnifiedStatsCard, 
  UnifiedTabsPanel,
  UnifiedEmptyState 
} from './UnifiedPanel';
import { 
  UnifiedPageHeader, 
  UnifiedSectionHeader,
  UnifiedListHeader 
} from './UnifiedHeader';

/**
 * Design System Showcase - Visual demonstration of all unified components
 * Use this as a reference for implementing new features
 */
export function DesignSystemShowcase() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [searchQuery, setSearchQuery] = useState('');
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'Medium'
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Page Header Example */}
      <UnifiedPageHeader
        title="Design System Showcase"
        subtitle="Visual reference for all unified components"
        icon={<Sparkles className="w-6 h-6" />}
        breadcrumbs={[
          { label: 'Home', onClick: () => console.log('Home') },
          { label: 'Admin' },
          { label: 'Design System' }
        ]}
        actions={
          <>
            <UnifiedButton variant="secondary" icon={<Settings className="w-4 h-4" />}>
              Settings
            </UnifiedButton>
            <UnifiedButton variant="accent" icon={<Sparkles className="w-4 h-4" />}>
              AI Generate
            </UnifiedButton>
            <UnifiedButton variant="primary" icon={<Plus className="w-4 h-4" />}>
              Create New
            </UnifiedButton>
          </>
        }
      />

      <div className="p-6 space-y-8">
        {/* Stats Cards Section */}
        <div>
          <UnifiedSectionHeader
            title="Statistics Overview"
            icon={<FileText className="w-5 h-5" />}
            description="Key metrics and performance indicators"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <UnifiedStatsCard
              icon={<Users className="w-6 h-6" />}
              label="Total Users"
              value="1,234"
              trend={{ value: "+12%", isPositive: true }}
            />
            <UnifiedStatsCard
              icon={<Layers className="w-6 h-6" />}
              label="Active Projects"
              value="42"
              trend={{ value: "-3%", isPositive: false }}
            />
            <UnifiedStatsCard
              icon={<FileText className="w-6 h-6" />}
              label="Tickets Closed"
              value="856"
              trend={{ value: "+28%", isPositive: true }}
            />
          </div>
        </div>

        {/* Buttons Section */}
        <UnifiedPanel title="Button Variants" icon={<Settings className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <UnifiedButton variant="primary" icon={<Save className="w-4 h-4" />}>
                Primary Button
              </UnifiedButton>
              <UnifiedButton variant="secondary" icon={<Edit2 className="w-4 h-4" />}>
                Secondary Button
              </UnifiedButton>
              <UnifiedButton variant="accent" icon={<Sparkles className="w-4 h-4" />}>
                Accent Button
              </UnifiedButton>
              <UnifiedButton variant="destructive" icon={<Trash2 className="w-4 h-4" />}>
                Destructive Button
              </UnifiedButton>
              <UnifiedButton variant="ghost">
                Ghost Button
              </UnifiedButton>
            </div>

            <div className="flex gap-3">
              <UnifiedIconButton icon={<Edit2 className="w-5 h-5" />} variant="primary" />
              <UnifiedIconButton icon={<Trash2 className="w-5 h-5" />} variant="destructive" />
              <UnifiedIconButton icon={<Settings className="w-5 h-5" />} variant="ghost" />
            </div>

            <UnifiedButtonGroup
              buttons={[
                { label: 'Save', onClick: () => {}, variant: 'primary', icon: <Save className="w-4 h-4" /> },
                { label: 'Cancel', onClick: () => {}, variant: 'secondary' }
              ]}
            />
          </div>
        </UnifiedPanel>

        {/* Form Components Section */}
        <UnifiedPanel title="Form Components" icon={<FileText className="w-5 h-5" />}>
          <UnifiedFormGrid columns={2}>
            <UnifiedField label="Title" icon={<FileText className="w-4 h-4" />} required>
              <UnifiedInput
                value={formValues.title}
                onChange={(value) => setFormValues({ ...formValues, title: value })}
                placeholder="Enter title..."
              />
            </UnifiedField>

            <UnifiedField label="Status" icon={<Layers className="w-4 h-4" />}>
              <UnifiedSelect
                value={formValues.status}
                onChange={(value) => setFormValues({ ...formValues, status: value })}
                options={[
                  { value: 'TODO', label: 'To Do' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'DONE', label: 'Done' }
                ]}
              />
            </UnifiedField>
          </UnifiedFormGrid>

          <div className="mt-4">
            <UnifiedField label="Description">
              <UnifiedTextarea
                value={formValues.description}
                onChange={(value) => setFormValues({ ...formValues, description: value })}
                placeholder="Enter description..."
                rows={4}
              />
            </UnifiedField>
          </div>
        </UnifiedPanel>

        {/* Tabs Section */}
        <UnifiedPanel title="Tabs Component" icon={<Layers className="w-5 h-5" />}>
          <UnifiedTabsPanel
            tabs={[
              {
                id: 'details',
                label: 'Details',
                icon: <FileText className="w-4 h-4" />,
                content: (
                  <div className="py-4">
                    <p style={{ color: '#000000' }}>
                      This is the details tab content. All content maintains the consistent color scheme.
                    </p>
                  </div>
                )
              },
              {
                id: 'comments',
                label: 'Comments',
                icon: <MessageSquare className="w-4 h-4" />,
                badge: 5,
                content: (
                  <div className="py-4">
                    <p style={{ color: '#000000' }}>
                      This is the comments tab with a badge showing unread count.
                    </p>
                  </div>
                )
              },
              {
                id: 'activity',
                label: 'Activity',
                icon: <Users className="w-4 h-4" />,
                content: (
                  <div className="py-4">
                    <p style={{ color: '#000000' }}>
                      This is the activity tab showing recent changes.
                    </p>
                  </div>
                )
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </UnifiedPanel>

        {/* List Header Section */}
        <div>
          <UnifiedListHeader
            title="All Items"
            count={42}
            icon={<FileText className="w-5 h-5" />}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            actions={
              <UnifiedButton variant="primary" icon={<Plus className="w-4 h-4" />}>
                Add Item
              </UnifiedButton>
            }
          />
          
          {/* Empty State Example */}
          <UnifiedPanel>
            <UnifiedEmptyState
              icon={<Inbox className="w-12 h-12" />}
              title="No items found"
              description="Get started by creating your first item using the button above"
              action={{
                label: "Create First Item",
                onClick: () => setShowModal(true)
              }}
            />
          </UnifiedPanel>
        </div>

        {/* Modal Trigger */}
        <UnifiedPanel title="Modal Example" icon={<Settings className="w-5 h-5" />}>
          <p className="mb-4" style={{ color: '#000000' }}>
            Click the button below to see the unified modal in action.
          </p>
          <UnifiedButton variant="primary" onClick={() => setShowModal(true)}>
            Open Modal
          </UnifiedButton>
        </UnifiedPanel>
      </div>

      {/* Modal Example */}
      <UnifiedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Example Modal"
        icon={<Layers className="w-6 h-6" />}
        size="lg"
        actions={
          <>
            <UnifiedButton variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </UnifiedButton>
            <UnifiedButton variant="primary" icon={<Save className="w-4 h-4" />}>
              Save Changes
            </UnifiedButton>
          </>
        }
      >
        <UnifiedSection title="Modal Content" icon={<FileText className="w-5 h-5" />}>
          <p className="mb-4" style={{ color: '#000000' }}>
            This modal demonstrates the unified design system. All modals follow this exact pattern:
          </p>
          <ul className="list-disc list-inside space-y-2" style={{ color: '#000000' }}>
            <li>Header with <strong>#14213D</strong> background</li>
            <li>Icon badge with <strong>#FCA311</strong> background</li>
            <li>White content area</li>
            <li>Light gray footer with action buttons</li>
          </ul>
        </UnifiedSection>
      </UnifiedModal>
    </div>
  );
}
