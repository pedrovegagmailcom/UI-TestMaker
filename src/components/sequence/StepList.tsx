import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { StepListItem } from './StepListItem'
import type { SequenceStep } from '../../types/sequence'

type StepListProps = {
  steps: SequenceStep[]
  selectedStepId: string | null
  isDragDisabled: boolean
  onSelect: (stepId: string) => void
  onReorder: (activeId: string, overId: string) => void
}

export function StepList({
  steps,
  selectedStepId,
  isDragDisabled,
  onSelect,
  onReorder,
}: StepListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    if (isDragDisabled) {
      return
    }
    const { active, over } = event
    if (!over) {
      return
    }
    onReorder(String(active.id), String(over.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={steps.map((step) => step.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-3" role="list">
          {steps.map((step) => (
            <StepListItem
              key={step.id}
              step={step}
              isSelected={step.id === selectedStepId}
              isDragDisabled={isDragDisabled}
              onSelect={onSelect}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
