import { adminApplicationsFunnel } from '@/actions/reports/applications.funnel.actions';
import { adminApplicationsLine } from '@/actions/reports/applications.line.actions';
import {
  admincitizenshipPie as adminCitizenshipPie,
  adminParticipantsPie,
} from '@/actions/reports/applications.pie.actions';
import { adminPaymentsBar } from '@/actions/reports/payments.bar.actions';
import { adminPaymentsPie } from '@/actions/reports/payments.pie.actions';
import Bar from '@/components/charts/bar';
import Funnel from '@/components/charts/funnel';
import Line from '@/components/charts/line';
import Pie from '@/components/charts/pie';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const ReportsPage = async () => {
  const [funnel, line, participantsPie, citizenshipPie, bar, paymentsPie] =
    await Promise.all([
      adminApplicationsFunnel(),
      adminApplicationsLine(),
      adminParticipantsPie(),
      adminCitizenshipPie(),
      adminPaymentsBar(),
      adminPaymentsPie(),
    ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-6">
      <Card className="md:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle>Program completion funnel</CardTitle>
          <CardDescription>
            Follow the journey from application to program completion
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {'error' in funnel ? (
            <p className="text-red-600">{funnel.error}</p>
          ) : (
            <Funnel data={funnel} />
          )}
        </CardContent>
      </Card>
      <Card className="md:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle>Participants per program</CardTitle>
          <CardDescription>
            Compare the distribution of participants per program
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {'error' in participantsPie ? (
            <p className="text-red-600">{participantsPie.error}</p>
          ) : (
            <Pie data={participantsPie} />
          )}
        </CardContent>
      </Card>
      <Card className="md:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle>Participants citizenship</CardTitle>
          <CardDescription>
            Compare the distribution of participants citizenship
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {'error' in citizenshipPie ? (
            <p className="text-red-600">{citizenshipPie.error}</p>
          ) : (
            <Pie data={citizenshipPie} />
          )}
        </CardContent>
      </Card>
      {/* <Card className="col-span-3"> */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Program applications</CardTitle>
          <CardDescription>
            Compare the program participants count based on applications
            throughout the year
          </CardDescription>
        </CardHeader>
        <CardContent>
          {'error' in line ? (
            <p className="text-red-600">{line.error}</p>
          ) : (
            // TODO:This should filter by date and be able to select multiple programs.
            // TODO:This tooltip should show the course code.
            <ScrollArea className="w-[calc(100vw-60px)] md:w-auto">
              <div className="h-96 w-[800px] md:w-auto">
                <Line data={line} />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      {/* <Card className="col-span-3"> */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Monthly revenues</CardTitle>
          <CardDescription>
            View monthly revenues, and the distribution of revenues across
            different programs
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 xl:grid-cols-3 xl:h-96 gap-x-4">
          <div className="h-56 md:h-full xl:col-span-1">
            {'error' in paymentsPie ? (
              <p className="text-red-600">{paymentsPie.error}</p>
            ) : (
              // TODO: Show total payments in the legends
              <Pie data={paymentsPie} />
            )}
          </div>
          <div className="h-80 xl:h-full xl:col-span-2">
            {'error' in bar ? (
              <p className="text-red-600">{bar.error}</p>
            ) : (
              // TODO: Show currencies for different payments;
              <ScrollArea className="w-[calc(100vw-60px)] md:w-[62vw]">
                <div className="h-72 w-[800px]">
                  <Bar {...bar} />
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
