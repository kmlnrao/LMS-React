import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationCard } from "@/components/hms-integration/integration-card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Database, Bed, Stethoscope, Link, UserCheck, GanttChart, Calendar } from "lucide-react";

export default function HmsIntegration() {
  return (
    <>
      <Helmet>
        <title>HMS Integration | LMS-React</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">HMS Integration</h1>
        <p className="text-muted-foreground">
          Connect laundry management system with hospital management system
        </p>
      </div>

      <Alert className="mb-6">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Integration Status: Active</AlertTitle>
        <AlertDescription>
          LMS-React is currently connected to the hospital management system.
          Last synchronized: Today at 08:45 AM
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data-mapping">Data Mapping</TabsTrigger>
          <TabsTrigger value="sync-settings">Sync Settings</TabsTrigger>
          <TabsTrigger value="logs">Integration Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>HMS Integration Overview</CardTitle>
              <CardDescription>
                Current integration status and available connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <IntegrationCard
                  title="Patient Records"
                  description="Sync patient information for specialized laundry requirements"
                  icon={<Database className="h-8 w-8" />}
                  status="active"
                />
                
                <IntegrationCard
                  title="Bed Management"
                  description="Automatically request linen based on bed occupancy"
                  icon={<Bed className="h-8 w-8" />}
                  status="active"
                />
                
                <IntegrationCard
                  title="Department Directory"
                  description="Sync department information for billing and delivery"
                  icon={<Stethoscope className="h-8 w-8" />}
                  status="active"
                />
                
                <IntegrationCard
                  title="Infection Control"
                  description="Special handling for contaminated linens"
                  icon={<AlertCircle className="h-8 w-8" />}
                  status="active"
                />
                
                <IntegrationCard
                  title="Staff Directory"
                  description="Sync staff information for task assignment"
                  icon={<UserCheck className="h-8 w-8" />}
                  status="active"
                />
                
                <IntegrationCard
                  title="Scheduler"
                  description="Align laundry schedule with hospital operations"
                  icon={<Calendar className="h-8 w-8" />}
                  status="inactive"
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Health</CardTitle>
                <CardDescription>System connection status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>API Connection</span>
                    </div>
                    <span className="text-sm text-green-500">Online</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>Database Sync</span>
                    </div>
                    <span className="text-sm text-green-500">Connected</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>Authentication</span>
                    </div>
                    <span className="text-sm text-green-500">Authorized</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                      <span>Task Scheduler</span>
                    </div>
                    <span className="text-sm text-yellow-500">Partial</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>Event Triggers</span>
                    </div>
                    <span className="text-sm text-green-500">Active</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Run Diagnostic
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Integration Actions</CardTitle>
                <CardDescription>Manage HMS connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Link className="h-4 w-4" />
                  Test Connection
                </Button>
                
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <GanttChart className="h-4 w-4" />
                  Configure Workflow Rules
                </Button>
                
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Database className="h-4 w-4" />
                  Sync Data Now
                </Button>
                
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Manage Department Mapping
                </Button>
                
                <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Reset Integration
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="data-mapping">
          <Card>
            <CardHeader>
              <CardTitle>Data Mapping Configuration</CardTitle>
              <CardDescription>
                Configure how data is mapped between LMS and HMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-gray-400">
                Data mapping configuration interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sync-settings">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Settings</CardTitle>
              <CardDescription>
                Configure how and when data is synchronized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-gray-400">
                Synchronization settings interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Integration Logs</CardTitle>
              <CardDescription>
                Review integration activity and troubleshoot issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-gray-400">
                Integration logs interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
