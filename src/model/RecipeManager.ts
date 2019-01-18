import { NoteModel, RecipeModel, RecipeStepModel } from "iocentro-collection-manager";
import { MandatoryGetVb } from "iocentro-datamodel";
import { Subscription } from "rxjs";

import { noNull } from "../Utils";
import { StepScreenData } from "../views/StepsScreen";
import { CookProcessorModel } from "./CookProcessorModel";

export class Recipe {
  constructor(
    private _recipe: RecipeModel,
    private readonly _device: CookProcessorModel | null,
    public onRecipeChange: (recipe: RecipeModel, device: CookProcessorModel | null, initial?: boolean) => void,
    public readonly userRecipe: boolean = false,
  ) {
    this._recipeChanged = this._recipe.modelChanged.subscribe(() => {
      this.onRecipeChange(this._recipe, this._device);
    });
    if (this._recipe && this._recipe.notes) {
      this._notesChanged = this._recipe.notes.modelChanged.subscribe(() => {
          this.onRecipeChange(this._recipe, this._device);
      });
    }

    if (this._device) {
      this._deviceSubscription = this._device.getModelObservable().subscribe((traits) => {
        let isStepInitial = false;
        const sourceOfChange = MandatoryGetVb(traits);
        const sourceIsStep = sourceOfChange == this._device!.currentStep ||
                             sourceOfChange == this._device!.requestedStep;

        if (!sourceIsStep &&
            /* (db): below is the values used in notification inside StepScreen
             *
             * this would really need some other solution so that StepScreen
             * subscribes to values that it needs and we don't need to filter
             * unwanted changes here. In this way the cooking and weight steps
             * would be self-updating for example. */
            sourceOfChange != this._device!.requestedProgramInProgress &&
            sourceOfChange != this._device!.weight &&
            sourceOfChange != this._device!.weightIncrementalAmount &&
            sourceOfChange != this._device!.weightTargetOverfill &&
            sourceOfChange != this._device!.weightTargetReached &&
            sourceOfChange != this._device!.isLidUnlocked &&
            sourceOfChange != this._device!.motorSpeed &&
            sourceOfChange != this._device!.currentTemp &&
            sourceOfChange != this._device!.targetTemp &&
            sourceOfChange != this._device!.currentTimeRemaining &&
            sourceOfChange != this._device!.targetTime) {
          return; // something uninteresting has changed
        }

        // update steps counters
        if (this._device && sourceIsStep) {
          const stepOnDevice = this._device.currentStep.sv();
          const requestedStep = this._device.requestedStep.sv();

          if (sourceOfChange == this._device.currentStep && this._currentStep == stepOnDevice) {
            return; // current step did not change
          }

          if ((stepOnDevice == requestedStep || requestedStep == null) && this._currentStep != stepOnDevice) {
            if (stepOnDevice > this._currentStep) {
              this._finishedSteps = this._currentStep;
            }
            this._currentStep = stepOnDevice;
          }

          if (sourceOfChange === this._device.requestedStep && requestedStep !== null) {
            isStepInitial = true;
          }
        }
        this.onRecipeChange(this._recipe, this._device, isStepInitial);
      });
    }
  }

  public isLoading() {
    return this._device ? noNull(this._device.requestedProgramInProgress.sv() as boolean, false) : false;
  }

  public dispose() {
    this._recipeChanged.unsubscribe();
    if (this._notesChanged) {
      this._notesChanged.unsubscribe();
    }
    if (this._deviceSubscription) {
      this._deviceSubscription.unsubscribe();
    }
  }

  public getSteps() {
    return this._recipe.steps;
  }

  public getCurrentStepData(): StepScreenData | undefined {
    const steps = this._steps;
    if (!steps) { return undefined; }

    const currentStep = steps[this._currentStep - 1];
    if (!currentStep) { return undefined; }

    const video = currentStep.video.sv() === null ? undefined : { uri: currentStep.video.sv() };

    // const videoTip = { // test video tip
    //   tip: "How To Choose The Best Wine For Cooking",
    //   source: video,
    // };

    const data: StepScreenData = {
      currentStep: this._currentStep,
      finishedSteps: this._finishedSteps,
      allSteps: steps.length,
      video,
      videoTip: undefined,
      stepDone: (this._currentStep <= this._finishedSteps),
      notes: this._currentStepNotes,
      title: this._recipe.title,
    };
    return data;
  }

  public rate(rating: number) {
    this._recipe.rate(rating);
  }

  public getRating() {
    return this._ratingStep ? this._recipe.rating.sv() : undefined;
  }

  public isRatingStep() {
    return this._ratingStep;
  }

  public getTitle() {
    return this._recipe.title.sv() as string;
  }

  public getDeviceName(): string {
    return (this._device && this._device.name.sv()) || "";
  }

  public setFavortie(favorite: boolean) {
    if (favorite) {
      this._recipe.markAsFavorite();
    } else {
      this._recipe.removeFromFavorites();
    }
  }

  public markStepDone() {
    if (this._finishedSteps < this._currentStep) {
      this._finishedSteps = this._currentStep;
      this.onRecipeChange(this._recipe, this._device);
    }
  }

  public restore(currentStep: number, finishedSteps: number) {
    const steps = this._steps;
    if (!steps) { return; }

    if (currentStep < steps.length) {
      this._currentStep = currentStep;
      this._finishedSteps = finishedSteps;
    } else {
      this._ratingStep = true;
    }

    // this._device && this._device.requestedStep.updateValue(this._currentStep);

    this.onRecipeChange(this._recipe, this._device, true);
  }

  public nextStep() {
    const steps = this._steps;
    if (!steps) { return; }

    if (this._finishedSteps < this._currentStep) {
      this._finishedSteps = this._currentStep;
    }
    if (this._currentStep < steps.length) {
      ++this._currentStep;
    } else {
      this._ratingStep = true;
    }

    this._device && this._device.requestedStep.updateValue(this._currentStep);

    this.onRecipeChange(this._recipe, this._device, true);
  }

  public prevStep() {
    --this._currentStep;
    if (this._currentStep < 1) {
      this._currentStep = 1;
    }

    this._device && this._device.requestedStep.updateValue(this._currentStep);

    this.onRecipeChange(this._recipe, this._device, true);
  }

  public addNote(text: string, title?: string) {
    if (this._ratingStep) {
      this._recipe.addNote(title || "", text);
    } else {
      /*`${I18n.t("note")} ${this._currentStep}`*/
      this._recipe.addNoteToStep("", text, this._currentStep - 1);
    }
  }

  private get _steps() {
    return this._recipe.steps.sv() as RecipeStepModel[] | null;
  }

  private get _currentStepNotes(): NoteModel[] {
    const notes = noNull<NoteModel[], NoteModel[]>(this._recipe.notes.items.sv(), []);
    if (this._ratingStep) {
      return notes.filter((note) => {
        return note.step.sv() === null;
      });
    } else {
      return notes.filter((note) => {
        const step: number | null = note.step.sv();
        return step === (this._currentStep - 1);
      });
    }
  }

  private _currentStep = 1;
  private _finishedSteps = 0;
  private _ratingStep = false;
  private _recipeChanged: Subscription;
  private _notesChanged: Subscription;
  private _deviceSubscription: Subscription | undefined;
}
