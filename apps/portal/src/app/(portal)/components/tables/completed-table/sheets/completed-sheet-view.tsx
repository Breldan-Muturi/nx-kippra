'use client';

import { ViewCompletedProgram } from '@/actions/completed-programs/single.completed.actions';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const CompletedSheet = ({
  handleDismiss,
  completed,
}: {
  handleDismiss: () => void;
  completed: ViewCompletedProgram;
}) => {
  return (
    <Sheet open onOpenChange={handleDismiss}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Completed Program Details</SheetTitle>
          <SheetDescription>
            Completed Program Description goes here
          </SheetDescription>
        </SheetHeader>
        {JSON.stringify(completed)}
        <SheetFooter>
          <Button type="submit">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CompletedSheet;
